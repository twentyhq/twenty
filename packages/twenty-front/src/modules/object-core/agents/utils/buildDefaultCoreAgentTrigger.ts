import { type AgentTrigger } from 'twenty-shared/application';
import { v4 } from 'uuid';

import { convertScheduleToCronExpression } from '@/workflow/workflow-trigger/utils/convertScheduleToCronExpression';
import { getCronTriggerDefaultSettings } from '@/workflow/workflow-trigger/utils/getCronTriggerDefaultSettings';

export const buildDefaultCoreAgentTrigger = (
  trigger: { type: 'CRON' } | { type: 'DATABASE_EVENT'; eventName: string },
): AgentTrigger => {
  if (trigger.type === 'CRON') {
    return {
      id: v4(),
      type: 'CRON',
      isActive: true,
      instructions: null,
      settings: {
        pattern:
          convertScheduleToCronExpression({
            type: 'CRON',
            settings: getCronTriggerDefaultSettings('DAYS'),
          }) ?? '',
      },
    };
  }

  return {
    id: v4(),
    type: 'DATABASE_EVENT',
    isActive: true,
    instructions: null,
    settings: { eventName: trigger.eventName },
  };
};
