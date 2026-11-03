import {
  AGENT_AVATAR_COLORS,
  AGENT_AVATAR_SHAPES,
  type AgentAvatarColor,
  type AgentAvatarShape,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { type ThemeColor } from 'twenty-ui/theme';
import { stringToThemeColor } from 'twenty-ui/utilities';

import { type CoreAgentAvatarIdentity } from '@/object-core/agents/types/CoreAgentAvatarIdentity';
import { type CoreAgentAvatarPendingUpdate } from '@/object-core/agents/types/CoreAgentAvatarPendingUpdate';
import { getAgentIcon } from '@/object-core/agents/utils/getAgentIcon';

const DEFAULT_AGENT_ICON = getAgentIcon(undefined);

const AVATAR_COLOR_BY_THEME_COLOR: Record<ThemeColor, AgentAvatarColor> = {
  red: 'red',
  ruby: 'red',
  crimson: 'red',
  tomato: 'orange',
  orange: 'orange',
  amber: 'orange',
  yellow: 'yellow',
  lime: 'green',
  grass: 'green',
  green: 'green',
  jade: 'turquoise',
  mint: 'turquoise',
  turquoise: 'turquoise',
  cyan: 'sky',
  sky: 'sky',
  blue: 'blue',
  iris: 'blue',
  violet: 'purple',
  purple: 'purple',
  plum: 'pink',
  pink: 'pink',
  bronze: 'orange',
  gold: 'yellow',
  brown: 'gray',
  gray: 'gray',
};

export const getCoreAgentAvatarAppearance = ({
  agent,
  pendingUpdates = [],
}: {
  agent: CoreAgentAvatarIdentity;
  pendingUpdates?: CoreAgentAvatarPendingUpdate[];
}): { color: AgentAvatarColor; shape: AgentAvatarShape; icon?: string } => {
  const appearance = pendingUpdates.reduce(
    (current, { patch }) => ({ ...current, ...patch }),
    {
      avatarColor: agent.avatarColor,
      avatarShape: agent.avatarShape,
    },
  );
  const selectedColor = AGENT_AVATAR_COLORS.find(
    (color) => color === appearance.avatarColor,
  );
  const selectedShape = AGENT_AVATAR_SHAPES.find(
    (shape) => shape === appearance.avatarShape,
  );
  const hasCustomization = isDefined(selectedColor) || isDefined(selectedShape);
  const configuredIcon = getAgentIcon(agent.icon);
  const hasConfiguredIcon = configuredIcon !== DEFAULT_AGENT_ICON;

  return {
    color:
      selectedColor ??
      AVATAR_COLOR_BY_THEME_COLOR[stringToThemeColor(agent.id)],
    shape: selectedShape ?? 'circle',
    icon: !hasCustomization && hasConfiguredIcon ? configuredIcon : undefined,
  };
};
