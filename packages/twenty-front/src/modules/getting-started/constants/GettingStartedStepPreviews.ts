import { type ComponentType } from 'react';

import { GettingStartedDataModelPreview } from '@/getting-started/components/step-preview/GettingStartedDataModelPreview';
import { GettingStartedFollowUpPreview } from '@/getting-started/components/step-preview/GettingStartedFollowUpPreview';
import { GettingStartedStepActionKey } from '~/generated-metadata/graphql';

export const GETTING_STARTED_STEP_PREVIEWS: Partial<
  Record<GettingStartedStepActionKey, ComponentType>
> = {
  [GettingStartedStepActionKey.CUSTOMIZE_DATA_MODEL]:
    GettingStartedDataModelPreview,
  [GettingStartedStepActionKey.FOLLOW_UP_DEALS]: GettingStartedFollowUpPreview,
};
