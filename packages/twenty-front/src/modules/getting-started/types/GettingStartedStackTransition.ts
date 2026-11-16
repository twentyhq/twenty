import { type GettingStartedStepActionKey } from '~/generated-metadata/graphql';

export type GettingStartedStackTransition = {
  selectedStepActionKey: GettingStartedStepActionKey;
  stackedStepActionKeys: GettingStartedStepActionKey[];
  previousSelectedStepActionKey: GettingStartedStepActionKey;
  previousStackedStepActionKeys: GettingStartedStepActionKey[];
  isBackward: boolean;
};
