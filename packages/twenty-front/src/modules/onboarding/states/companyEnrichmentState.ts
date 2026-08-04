import { isNonEmptyString, isObject } from '@sniptt/guards';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const companyEnrichmentState =
  createAtomState<WorkspaceCompanyEnrichment | null>({
    key: 'companyEnrichmentState',
    defaultValue: null,
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
    validateInitFn: (payload) =>
      isObject(payload) && isNonEmptyString(payload.domain),
  });
