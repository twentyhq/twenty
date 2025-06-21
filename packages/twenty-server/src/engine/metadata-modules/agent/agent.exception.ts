import { CustomException } from 'src/utils/custom-exception';

export class AgentException extends CustomException {
  declare code: AgentExceptionCode;
  constructor(message: string, code: AgentExceptionCode) {
    super(message, code);
  }
}

export enum AgentExceptionCode {
  AGENT_NOT_FOUND = 'AGENT_NOT_FOUND',
  FEATURE_FLAG_INVALID = 'FEATURE_FLAG_INVALID',
  AGENT_ALREADY_EXISTS = 'AGENT_ALREADY_EXISTS',
  AGENT_EXECUTION_FAILED = 'AGENT_EXECUTION_FAILED',
  AGENT_EXECUTION_LIMIT_REACHED = 'AGENT_EXECUTION_LIMIT_REACHED',
  AGENT_INVALID_PROMPT = 'AGENT_INVALID_PROMPT',
  AGENT_INVALID_MODEL = 'AGENT_INVALID_MODEL',
  UNSUPPORTED_MODEL = 'UNSUPPORTED_MODEL',
  API_KEY_NOT_CONFIGURED = 'API_KEY_NOT_CONFIGURED',
}
