import { useTheme } from 'twenty-ui/theme';

import { CoreAgentAvatar } from '@/object-core/agents/components/CoreAgentAvatar';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { CoreObjectNameCell } from '@/object-core/components/cells/CoreObjectNameCell';

type CoreAgentNameCellProps = {
  agent: Pick<
    CoreAgent,
    'id' | 'label' | 'icon' | 'avatarColor' | 'avatarShape'
  >;
};

export const CoreAgentNameCell = ({ agent }: CoreAgentNameCellProps) => {
  const theme = useTheme();

  return (
    <CoreObjectNameCell
      name={agent.label}
      avatarColorSeed={agent.id}
      avatarShape="square"
      avatar={<CoreAgentAvatar agent={agent} size={theme.icon.size.md} />}
    />
  );
};
