import { useCallback, useEffect, useRef, useState } from 'react';
import { callPropelRoute } from '@/propel/lib/callPropelRoute';
import {
  clearDraft,
  loadDraft,
  newDraft,
  saveDraft,
} from '@/propel/lib/listingStudioConfig';
import {
  type StudioDraft,
  type StudioEntry,
  type StudioFacts,
  type StudioPreview,
  type StudioPreviewResponse,
  type StudioStartResponse,
  type StudioStep,
} from '@/propel/types/listingStudio';

// Owns the whole Studio draft lifecycle for the hero (S2):
//   • resume the localStorage draft on mount (spec §4 item 11),
//   • begin a new draft for entry A (scratch) / entry B (from a CRM property),
//   • mutate facts + advance/retreat the step rail,
//   • autosave (debounced) to POST /s/listing-studio/save (a stateless ACK in S2),
//   • rebuild the live PF preview (debounced) from POST /s/listing-studio/preview.
//
// Fails soft like the other heroes: a null route response is surfaced as an honest
// save/preview indicator, never a throw. Draft persistence is local in S2; only
// the persistence target changes when the record-backed schema field lands.

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const AUTOSAVE_DEBOUNCE_MS = 600;
const PREVIEW_DEBOUNCE_MS = 400;

export interface ListingStudioState {
  /** null until an entry is chosen (the launcher is showing). */
  draft: StudioDraft | null;
  preview: StudioPreview;
  saveState: SaveState;
  /** true while entry B is reading the CRM property for prefill. */
  starting: boolean;
  /** Begin entry A (blank). */
  startScratch: () => void;
  /** Begin entry B (prefill from a CRM property). */
  startFromProperty: (propertyId: string) => Promise<void>;
  /** Resume a draft we already loaded (the launcher's "Resume" action). */
  resume: (draft: StudioDraft) => void;
  /** Merge a partial facts patch + autosave + re-preview. */
  patchFacts: (patch: Partial<StudioFacts>) => void;
  /** Jump the rail to a step. */
  goToStep: (step: StudioStep) => void;
  /** Discard the draft and return to the launcher. */
  discard: () => void;
}

export const useListingStudioDraft = (): ListingStudioState => {
  const [draft, setDraft] = useState<StudioDraft | null>(null);
  const [preview, setPreview] = useState<StudioPreview>({});
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [starting, setStarting] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guards stale async writes from clobbering a newer draft (e.g. discard mid-save).
  const draftIdRef = useRef<string | null>(null);

  // Resume the local draft once on mount (does NOT auto-open it — the launcher
  // offers "Resume"; we just make it available). preview rebuilds when resumed.
  const resumedRef = useRef<StudioDraft | null>(null);
  if (resumedRef.current === null) {
    resumedRef.current = loadDraft();
  }

  useEffect(() => {
    return () => {
      if (saveTimer.current !== null) clearTimeout(saveTimer.current);
      if (previewTimer.current !== null) clearTimeout(previewTimer.current);
    };
  }, []);

  const schedulePreview = useCallback((facts: StudioFacts, id: string) => {
    if (previewTimer.current !== null) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => {
      void callPropelRoute<StudioPreviewResponse>('/listing-studio/preview', {
        facts,
      }).then((res) => {
        if (draftIdRef.current !== id) return; // a newer draft took over
        setPreview(res?.preview ?? {});
      });
    }, PREVIEW_DEBOUNCE_MS);
  }, []);

  const scheduleSave = useCallback((next: StudioDraft) => {
    if (saveTimer.current !== null) clearTimeout(saveTimer.current);
    setSaveState('saving');
    saveTimer.current = setTimeout(() => {
      void callPropelRoute<{ ok: boolean }>('/listing-studio/save', {
        draftId: next.draftId,
        step: next.step,
        facts: next.facts,
      }).then((res) => {
        if (draftIdRef.current !== next.draftId) return;
        setSaveState(res?.ok === true ? 'saved' : 'error');
      });
    }, AUTOSAVE_DEBOUNCE_MS);
  }, []);

  // Adopt a draft as the live one: persist locally, set refs, kick preview.
  const adopt = useCallback(
    (next: StudioDraft) => {
      draftIdRef.current = next.draftId;
      setDraft(next);
      saveDraft(next);
      setSaveState('saved');
      schedulePreview(next.facts, next.draftId);
    },
    [schedulePreview],
  );

  const startScratch = useCallback(() => {
    adopt(newDraft('scratch'));
  }, [adopt]);

  const startFromProperty = useCallback(
    async (propertyId: string) => {
      setStarting(true);
      const local = newDraft('property', propertyId);
      draftIdRef.current = local.draftId;
      const res = await callPropelRoute<StudioStartResponse>(
        '/listing-studio/start',
        { entry: 'property', draftId: local.draftId, propertyId },
      );
      setStarting(false);
      // The route returns the property's facts as the draft; fall back to the
      // blank local draft if the read failed (the user can still fill manually).
      const next: StudioDraft =
        res?.ok === true && res.draft ? res.draft : local;
      adopt(next);
    },
    [adopt],
  );

  const resume = useCallback(
    (resumed: StudioDraft) => {
      adopt(resumed);
    },
    [adopt],
  );

  const patchFacts = useCallback(
    (patch: Partial<StudioFacts>) => {
      setDraft((cur) => {
        if (cur === null) return cur;
        const next: StudioDraft = { ...cur, facts: { ...cur.facts, ...patch } };
        saveDraft(next);
        scheduleSave(next);
        schedulePreview(next.facts, next.draftId);
        return next;
      });
    },
    [scheduleSave, schedulePreview],
  );

  const goToStep = useCallback(
    (step: StudioStep) => {
      setDraft((cur) => {
        if (cur === null || cur.step === step) return cur;
        const next: StudioDraft = { ...cur, step };
        saveDraft(next);
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave],
  );

  const discard = useCallback(() => {
    draftIdRef.current = null;
    if (saveTimer.current !== null) clearTimeout(saveTimer.current);
    if (previewTimer.current !== null) clearTimeout(previewTimer.current);
    clearDraft();
    resumedRef.current = null;
    setDraft(null);
    setPreview({});
    setSaveState('idle');
  }, []);

  return {
    draft,
    preview,
    saveState,
    starting,
    startScratch,
    startFromProperty,
    resume,
    patchFacts,
    goToStep,
    discard,
  };
};

// Expose the on-mount resumable draft separately so the launcher can offer it
// without the hook auto-opening it.
export const useResumableDraft = (): StudioDraft | null => {
  const ref = useRef<StudioDraft | null>(null);
  if (ref.current === null) ref.current = loadDraft();
  return ref.current;
};

// re-export so a non-property entry never needs the entry literal at the call site
export type { StudioEntry };
