import { registerEnumType } from '@nestjs/graphql';

// mirrors AiRunEventType in twenty-shared
export enum AiRunEventTypeEnum {
  RUN_STARTED = 'RUN_STARTED',
  MESSAGE = 'MESSAGE',
  TOOL_CALL = 'TOOL_CALL',
  TOOL_RESULT = 'TOOL_RESULT',
  INTERACTION = 'INTERACTION',
  RUN_COMPLETED = 'RUN_COMPLETED',
  RUN_FAILED = 'RUN_FAILED',
}

registerEnumType(AiRunEventTypeEnum, { name: 'AiRunEventType' });
