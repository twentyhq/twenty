import { CORE_AGENT_ICON_COLORS } from '@/object-core/agents/constants/CoreAgentIconColors';
import { CORE_AGENT_ICON_FACE_PATHS } from '@/object-core/agents/constants/CoreAgentIconFacePaths';

const FACE_PATHS = Object.values(CORE_AGENT_ICON_FACE_PATHS);

export const getCoreAgentIconVariant = (agentId: string) => {
  let hash = 0;
  for (let index = 0; index < agentId.length; index++) {
    hash = (agentId.charCodeAt(index) + ((hash << 5) - hash)) | 0;
  }

  const positiveHash = Math.abs(hash);

  return {
    facePath: FACE_PATHS[positiveHash % FACE_PATHS.length],
    color:
      CORE_AGENT_ICON_COLORS[
        Math.floor(positiveHash / FACE_PATHS.length) %
          CORE_AGENT_ICON_COLORS.length
      ],
  };
};
