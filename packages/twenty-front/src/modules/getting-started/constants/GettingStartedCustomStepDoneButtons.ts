import { type ComponentType } from 'react';

import { GettingStartedChatThreadDoneButton } from '@/getting-started/components/GettingStartedChatThreadDoneButton';
import { GettingStartedInviteDoneButton } from '@/getting-started/components/GettingStartedInviteDoneButton';
import { type GettingStartedStepDoneButtonProps } from '@/getting-started/types/GettingStartedStepDoneButtonProps';
import { GettingStartedStepActionKey } from '~/generated-metadata/graphql';

export const GETTING_STARTED_CUSTOM_STEP_DONE_BUTTONS: Partial<
  Record<
    GettingStartedStepActionKey,
    ComponentType<GettingStartedStepDoneButtonProps>
  >
> = {
  [GettingStartedStepActionKey.IMPORT_DATA]: GettingStartedChatThreadDoneButton,
  [GettingStartedStepActionKey.INVITE_TEAM]: GettingStartedInviteDoneButton,
};
