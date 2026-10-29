import { type ComponentType } from 'react';

import { GettingStartedAppsAction } from '@/getting-started/components/GettingStartedAppsAction';
import { GettingStartedImportAction } from '@/getting-started/components/GettingStartedImportAction';
import { GettingStartedInviteAction } from '@/getting-started/components/GettingStartedInviteAction';
import { GettingStartedMailboxAction } from '@/getting-started/components/GettingStartedMailboxAction';
import { GettingStartedStep } from '~/generated-metadata/graphql';

export const GETTING_STARTED_CUSTOM_STEP_ACTIONS: Partial<
  Record<GettingStartedStep, ComponentType>
> = {
  [GettingStartedStep.CONNECT_MAILBOX]: GettingStartedMailboxAction,
  [GettingStartedStep.IMPORT_DATA]: GettingStartedImportAction,
  [GettingStartedStep.INSTALL_APP]: GettingStartedAppsAction,
  [GettingStartedStep.INVITE_TEAM]: GettingStartedInviteAction,
};
