import { useCallback, useEffect, useState } from 'react';
import { callPropelRoute } from '@/propel/lib/callPropelRoute';
import {
  type SegmentOption,
  type SequenceHubPayload,
  type SequenceRow,
  type WaTemplateOption,
} from '@/propel/types/sequenceEditor';

// Loads the sequence slice of the marketing hub from POST /s/marketing/hub — the
// SAME endpoint the Marketing Home + Campaign Builder heroes read, sliced for a
// different surface. The route server-derives the acting member from the session
// token (MANAGER/ADMIN → data, else a NOT_FOUND envelope), so we send an empty body
// and never a client-sent identity.
//
// Fails soft: a null route response leaves EVERY list empty, so the editor renders
// honest empty states ("No sequences yet", "No saved audiences yet") and NEVER
// zero-fills or fabricates a sequence/count. Enrollment counts shown later come
// straight from this payload — verbatim, never invented.

export type SequenceEditorData = {
  sequences: SequenceRow[];
  segments: SegmentOption[];
  waTemplates: WaTemplateOption[];
  isLoading: boolean;
  /** true once at least one fetch attempt has settled (success or failure) */
  loaded: boolean;
  reload: () => void;
};

const EMPTY = {
  sequences: [] as SequenceRow[],
  segments: [] as SegmentOption[],
  waTemplates: [] as WaTemplateOption[],
};

export const useSequenceEditorData = (): SequenceEditorData => {
  const [hub, setHub] = useState<SequenceHubPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    void callPropelRoute<SequenceHubPayload>('/marketing/hub', {}).then(
      (res) => {
        if (!active) return;
        setHub(res);
        setIsLoading(false);
        setLoaded(true);
      },
    );
    return () => {
      active = false;
    };
  }, [nonce]);

  return {
    sequences: hub?.sequences ?? EMPTY.sequences,
    segments: hub?.segments ?? EMPTY.segments,
    waTemplates: hub?.waTemplates ?? EMPTY.waTemplates,
    isLoading,
    loaded,
    reload,
  };
};
