import { type AgentTrigger } from 'twenty-shared/application';
import { v4 } from 'uuid';

export const buildDefaultCoreAgentTrigger = ({
  type,
  objectNameSingular,
}: {
  type: AgentTrigger['type'];
  objectNameSingular: string;
}): AgentTrigger => {
  if (type === 'CRON') {
    return {
      id: v4(),
      type: 'CRON',
      isActive: true,
      instructions: null,
      settings: { pattern: '0 9 * * 1' },
    };
  }

  return {
    id: v4(),
    type: 'DATABASE_EVENT',
    isActive: true,
    instructions: null,
    settings: { eventName: `${objectNameSingular}.created` },
  };
};
