import { type CORE_AGENT_RECORD_ACCESS_LEVELS } from '@/object-core/agents/constants/CoreAgentRecordAccessLevels';

export type CoreAgentRecordAccessLevel =
  (typeof CORE_AGENT_RECORD_ACCESS_LEVELS)[number]['level'];
