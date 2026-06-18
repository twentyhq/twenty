import {
  type StudioDraft,
  type StudioEntry,
  type StudioStep,
  STUDIO_STEPS,
} from '@/propel/types/listingStudio';

// Listing Studio hero — step metadata + client-side draft persistence (S2).
//
// The 6-step rail is driven by this ordered metadata. Draft state is persisted to
// localStorage in S2 (the CRM routes are stateless this slice — see the lane spec
// §13/§15); a single in-flight draft per browser is enough to prove resume.

export interface StudioStepMeta {
  id: StudioStep;
  /** Rail label. */
  label: string;
  /** One-line "what this step does" for the rail + the empty pane. */
  blurb: string;
}

// Order + copy verbatim from the flow (lane spec §3): Intake → Details & price →
// Photos → Write-up → Permit → Publish.
export const STUDIO_STEP_META: readonly StudioStepMeta[] = [
  { id: 'intake', label: 'Intake', blurb: 'Drop the mandate documents and photos.' },
  { id: 'details', label: 'Details & price', blurb: 'Confirm the facts and reality-check the price.' },
  { id: 'photos', label: 'Photos', blurb: 'Order, brand, and spec-check the unit photos.' },
  { id: 'writeup', label: 'Write-up', blurb: 'Generate the EN + AR listing copy.' },
  { id: 'permit', label: 'Permit', blurb: 'Capture and validate the Trakheesi permit.' },
  { id: 'publish', label: 'Publish', blurb: 'Check eligibility, cost, and go live on Property Finder.' },
] as const;

export const stepIndex = (step: StudioStep): number =>
  STUDIO_STEPS.indexOf(step);

export const stepAtIndex = (index: number): StudioStep =>
  STUDIO_STEPS[Math.max(0, Math.min(index, STUDIO_STEPS.length - 1))];

export const isFirstStep = (step: StudioStep): boolean => stepIndex(step) === 0;
export const isLastStep = (step: StudioStep): boolean =>
  stepIndex(step) === STUDIO_STEPS.length - 1;

// ── Client-side draft persistence (S2) ────────────────────────────────────────
// One in-flight draft per browser. Survives reload so "resume mid-flow" (spec §4
// item 11) works without the record-backed schema field (an open item, §13).

const DRAFT_KEY = 'propel.listingStudio.draft.v1';

export const loadDraft = (): StudioDraft | null => {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (raw === null || raw === '') return null;
    const parsed = JSON.parse(raw) as StudioDraft;
    // Minimal shape guard — a corrupt/old blob must not crash the hero.
    if (
      typeof parsed?.draftId !== 'string' ||
      !STUDIO_STEPS.includes(parsed.step) ||
      typeof parsed.facts !== 'object' ||
      parsed.facts === null
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const saveDraft = (draft: StudioDraft): void => {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // localStorage full / disabled — the in-memory draft still works this session.
  }
};

export const clearDraft = (): void => {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // no-op
  }
};

// Mint a client draft id (the CRM route echoes whatever we send in S2).
export const mintDraftId = (): string =>
  `draft-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;

// A fresh draft for a chosen entry. Entry B lands on Details (facts prefill);
// entry A starts at Intake.
export const newDraft = (
  entry: StudioEntry,
  propertyId?: string,
): StudioDraft => ({
  draftId: mintDraftId(),
  entry,
  propertyId,
  facts: {},
  step: entry === 'property' ? 'details' : 'intake',
});
