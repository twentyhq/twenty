import { type ComponentType } from 'react';

import { GettingStartedAppsAction } from '@/getting-started/components/GettingStartedAppsAction';
import { GettingStartedImportAction } from '@/getting-started/components/GettingStartedImportAction';
import { GettingStartedInviteAction } from '@/getting-started/components/GettingStartedInviteAction';
import { GettingStartedMailboxAction } from '@/getting-started/components/GettingStartedMailboxAction';
import { GettingStartedStepActionKey } from '~/generated-metadata/graphql';

export const GETTING_STARTED_CUSTOM_STEP_ACTIONS: Partial<
  Record<GettingStartedStepActionKey, ComponentType>
> = {
  [GettingStartedStepActionKey.CONNECT_MAILBOX]: GettingStartedMailboxAction,
  [GettingStartedStepActionKey.IMPORT_DATA]: GettingStartedImportAction,
  [GettingStartedStepActionKey.INSTALL_APP]: GettingStartedAppsAction,
  [GettingStartedStepActionKey.INVITE_TEAM]: GettingStartedInviteAction,
};
