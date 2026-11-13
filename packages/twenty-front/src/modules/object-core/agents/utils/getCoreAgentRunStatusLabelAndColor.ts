import { t } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';
import { type ThemeColor } from 'twenty-ui/theme';

import { AgentTurnStatus } from '~/generated-metadata/graphql';

export const getCoreAgentRunStatusLabelAndColor = (
  status: AgentTurnStatus,
): { label: string; color: ThemeColor } => {
  switch (status) {
    case AgentTurnStatus.RUNNING:
      return { label: t`Running`, color: 'blue' };
    case AgentTurnStatus.WAITING_FOR_INPUT:
      return { label: t`Waiting`, color: 'orange' };
    case AgentTurnStatus.COMPLETED:
      return { label: t`Done`, color: 'green' };
    case AgentTurnStatus.CANCELLED:
      return { label: t`Cancelled`, color: 'gray' };
    case AgentTurnStatus.FAILED:
      return { label: t`Failed`, color: 'red' };
    default:
      return assertUnreachable(status);
  }
};
