import { Status } from 'twenty-ui/primitives/data-display';

import { getCoreAgentRunStatusLabelAndColor } from '@/object-core/agents/utils/getCoreAgentRunStatusLabelAndColor';
import { AgentTurnStatus } from '~/generated-metadata/graphql';

type CoreAgentRunStatusProps = {
  status: AgentTurnStatus;
};

export const CoreAgentRunStatus = ({ status }: CoreAgentRunStatusProps) => {
  const { label, color } = getCoreAgentRunStatusLabelAndColor(status);

  return (
    <Status color={color} loading={status === AgentTurnStatus.RUNNING}>
      {label}
    </Status>
  );
};
