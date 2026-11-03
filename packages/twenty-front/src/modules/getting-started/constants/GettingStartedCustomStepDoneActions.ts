import { type ComponentType } from 'react';

import { GettingStartedImportDoneAction } from '@/getting-started/components/GettingStartedImportDoneAction';
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
  [GettingStartedStepActionKey.IMPORT_DATA]: GettingStartedImportDoneAction,
  [GettingStartedStepActionKey.INVITE_TEAM]: GettingStartedInviteDoneAction,
};
