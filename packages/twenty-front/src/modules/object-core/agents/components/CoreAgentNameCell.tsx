import { useIcons } from 'twenty-ui/icon';

import { CoreObjectNameCell } from '@/object-core/components/cells/CoreObjectNameCell';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';

type CoreAgentNameCellProps = {
  agent: Pick<CoreAgent, 'id' | 'label' | 'icon'>;
};

export const CoreAgentNameCell = ({ agent }: CoreAgentNameCellProps) => {
  const { getIcon } = useIcons();

  return (
    <CoreObjectNameCell
      name={agent.label}
      avatarColorSeed={agent.id}
      avatarShape="square"
      Icon={getIcon(agent.icon ?? 'IconLego')}
    />
  );
};
