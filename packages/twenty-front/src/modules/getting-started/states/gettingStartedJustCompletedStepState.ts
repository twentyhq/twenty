import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

import { type GettingStartedStepActionKey } from '~/generated-metadata/graphql';

export const gettingStartedJustCompletedStepState =
  createAtomState<GettingStartedStepActionKey | null>({
    key: 'gettingStartedJustCompletedStepState',
    defaultValue: null,
  });
