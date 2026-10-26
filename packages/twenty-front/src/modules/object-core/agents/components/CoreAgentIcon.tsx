import { isDefined } from 'twenty-shared/utils';
import { type ThemeColor, themeCssVariables } from 'twenty-ui/theme';

import { CORE_AGENT_ICON_FACE_PATHS } from '@/object-core/agents/constants/CoreAgentIconFacePaths';
import { getCoreAgentIconVariant } from '@/object-core/agents/utils/getCoreAgentIconVariant';

const FACE_GRID_SIZE = 14;

const DEFAULT_VARIANT: { facePath: string; color: ThemeColor } = {
  facePath: CORE_AGENT_ICON_FACE_PATHS.classic,
  color: 'blue',
};

type CoreAgentIconProps = {
  agentId?: string;
  size: number;
};

export const CoreAgentIcon = ({ agentId, size }: CoreAgentIconProps) => {
  const { facePath, color } = isDefined(agentId)
    ? getCoreAgentIconVariant(agentId)
    : DEFAULT_VARIANT;
  const borderRadius = size >= 20 ? 4 : 2;

  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox={`0 0 ${FACE_GRID_SIZE} ${FACE_GRID_SIZE}`}
      shapeRendering="crispEdges"
    >
      <rect
        width={FACE_GRID_SIZE}
        height={FACE_GRID_SIZE}
        rx={(borderRadius * FACE_GRID_SIZE) / size}
        style={{ fill: themeCssVariables.color[`${color}4`] }}
      />
      <path
        d={facePath}
        style={{ fill: themeCssVariables.color[`${color}10`] }}
      />
    </svg>
  );
};
