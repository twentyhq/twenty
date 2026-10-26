import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { GettingStartedStep } from '~/generated-metadata/graphql';

export const GETTING_STARTED_AI_THREAD_PROMPTS: Partial<
  Record<
    GettingStartedStep,
    { label: MessageDescriptor; prompt: MessageDescriptor }
  >
> = {
  [GettingStartedStep.FOLLOW_UP_DEALS]: {
    label: msg`Follow-up instructions`,
    prompt: msg`Every Monday, draft a follow-up email for each deal closing in the next 30 days.`,
  },
};
