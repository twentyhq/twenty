import { type ComponentType } from 'react';

import { GettingStartedAppsAction } from '@/getting-started/components/GettingStartedAppsAction';
import { GettingStartedMailboxDoneAction } from '@/getting-started/components/GettingStartedMailboxDoneAction';
import { GettingStartedStepActionKey } from '~/generated-metadata/graphql';

export const GETTING_STARTED_CUSTOM_STEP_DONE_ACTIONS: Partial<
  Record<GettingStartedStepActionKey, ComponentType>
> = {
  [GettingStartedStepActionKey.CONNECT_MAILBOX]:
    GettingStartedMailboxDoneAction,
  [GettingStartedStepActionKey.INSTALL_APP]: GettingStartedAppsAction,
};
