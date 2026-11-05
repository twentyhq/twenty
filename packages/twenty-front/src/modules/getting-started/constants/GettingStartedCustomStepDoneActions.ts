import { type ComponentType } from 'react';

import { GettingStartedChatThreadDoneAction } from '@/getting-started/components/GettingStartedChatThreadDoneAction';
import { GettingStartedInviteDoneAction } from '@/getting-started/components/GettingStartedInviteDoneAction';
import { GettingStartedMailboxDoneAction } from '@/getting-started/components/GettingStartedMailboxDoneAction';
import { type GettingStartedStepDoneActionProps } from '@/getting-started/types/GettingStartedStepDoneActionProps';
import { GettingStartedStepActionKey } from '~/generated-metadata/graphql';

export const GETTING_STARTED_CUSTOM_STEP_DONE_ACTIONS: Partial<
  Record<
    GettingStartedStepActionKey,
    ComponentType<GettingStartedStepDoneActionProps>
  >
> = {
  [GettingStartedStepActionKey.CONNECT_MAILBOX]:
    GettingStartedMailboxDoneAction,
  [GettingStartedStepActionKey.IMPORT_DATA]: GettingStartedChatThreadDoneAction,
  [GettingStartedStepActionKey.INVITE_TEAM]: GettingStartedInviteDoneAction,
};
