import { type GettingStartedStepDoneCta } from '@/getting-started/types/GettingStartedStepDoneCta';
import { isDefined } from 'twenty-shared/utils';

import {
  GettingStartedStepActionKey,
  type GettingStartedStepDefinition,
  GettingStartedStepKind,
} from '~/generated-metadata/graphql';

export const getGettingStartedStepDoneCta = ({
  kind,
  actionKey,
  doneChatThreadId,
}: Pick<
  GettingStartedStepDefinition,
  'kind' | 'actionKey' | 'doneChatThreadId'
>): GettingStartedStepDoneCta | null => {
  if (kind === GettingStartedStepKind.WORKFLOW) {
    return { type: 'workflow', stepActionKey: actionKey };
  }

  if (actionKey === GettingStartedStepActionKey.INVITE_TEAM) {
    return { type: 'invite' };
  }

  const isChatThreadStep =
    kind === GettingStartedStepKind.PROMPT ||
    actionKey === GettingStartedStepActionKey.IMPORT_DATA;

  if (isChatThreadStep && isDefined(doneChatThreadId)) {
    return { type: 'chatThread', chatThreadId: doneChatThreadId };
  }

  return null;
};
