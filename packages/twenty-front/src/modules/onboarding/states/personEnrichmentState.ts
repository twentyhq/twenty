import { isNonEmptyString, isObject } from '@sniptt/guards';
import { type WorkspacePersonEnrichment } from 'twenty-shared/workspace';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const personEnrichmentState =
  createAtomState<WorkspacePersonEnrichment | null>({
    key: 'personEnrichmentState',
    defaultValue: null,
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
    validateInitFn: (payload) =>
      isObject(payload) && isNonEmptyString(payload.email),
  });
