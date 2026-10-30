import { type ComponentType } from 'react';

import { GettingStartedMailboxDoneDescription } from '@/getting-started/components/GettingStartedMailboxDoneDescription';
import { type GettingStartedStepDoneDescriptionProps } from '@/getting-started/types/GettingStartedStepDoneDescriptionProps';
import { GettingStartedStep } from '~/generated-metadata/graphql';

export const GETTING_STARTED_CUSTOM_STEP_DONE_DESCRIPTIONS: Partial<
  Record<
    GettingStartedStep,
    ComponentType<GettingStartedStepDoneDescriptionProps>
  >
> = {
  [GettingStartedStep.CONNECT_MAILBOX]: GettingStartedMailboxDoneDescription,
};
