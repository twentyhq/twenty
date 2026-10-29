import { type ComponentType } from 'react';

import { GettingStartedAppsAction } from '@/getting-started/components/GettingStartedAppsAction';
import { GettingStartedImportAction } from '@/getting-started/components/GettingStartedImportAction';
import { GettingStartedInviteAction } from '@/getting-started/components/GettingStartedInviteAction';
import { GettingStartedMailboxAction } from '@/getting-started/components/GettingStartedMailboxAction';
import { GettingStartedPromptAction } from '@/getting-started/components/GettingStartedPromptAction';
import { GettingStartedWorkflowAction } from '@/getting-started/components/GettingStartedWorkflowAction';
import { GettingStartedStep } from '~/generated-metadata/graphql';

export const GETTING_STARTED_STEP_ACTIONS: Record<
  GettingStartedStep,
  ComponentType<{ step: GettingStartedStep }>
> = {
  [GettingStartedStep.CONNECT_MAILBOX]: GettingStartedMailboxAction,
  [GettingStartedStep.IMPORT_DATA]: GettingStartedImportAction,
  [GettingStartedStep.INSTALL_APP]: GettingStartedAppsAction,
  [GettingStartedStep.INVITE_TEAM]: GettingStartedInviteAction,
  [GettingStartedStep.HANDOVER_DEALS]: GettingStartedWorkflowAction,
  [GettingStartedStep.FOLLOW_UP_DEALS]: GettingStartedPromptAction,
};
