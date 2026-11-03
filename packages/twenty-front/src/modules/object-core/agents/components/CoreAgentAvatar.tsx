import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon/provider';
import { useTheme } from 'twenty-ui/theme';

import { AiAgentAvatar } from '@/ai/components/AiAgentAvatar';
import { coreAgentAvatarPendingUpdatesFamilyState } from '@/object-core/agents/states/coreAgentAvatarPendingUpdatesFamilyState';
import { type CoreAgentAvatarIdentity } from '@/object-core/agents/types/CoreAgentAvatarIdentity';
import { getCoreAgentAvatarAppearance } from '@/object-core/agents/utils/getCoreAgentAvatarAppearance';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

type CoreAgentAvatarProps = {
  agent: CoreAgentAvatarIdentity;
  size: number;
};

export const CoreAgentAvatar = ({ agent, size }: CoreAgentAvatarProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const coreAgentAvatarPendingUpdates = useAtomFamilyStateValue(
    coreAgentAvatarPendingUpdatesFamilyState,
    agent.id,
  );
  const appearance = getCoreAgentAvatarAppearance({
    agent,
    pendingUpdates: coreAgentAvatarPendingUpdates,
  });

  if (isDefined(appearance.icon)) {
    const Icon = getIcon(appearance.icon);

    return <Icon aria-hidden size={size} stroke={theme.icon.stroke.sm} />;
  }

  return (
    <AiAgentAvatar
      color={appearance.color}
      shape={appearance.shape}
      size={size}
    />
  );
};
