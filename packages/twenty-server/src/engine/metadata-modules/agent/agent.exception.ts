import { CustomException } from 'src/utils/custom-exception';

export class AgentException extends CustomException {
  declare code: AgentExceptionCode;
  constructor(message: string, code: AgentExceptionCode) {
    super(message, code);
  }
}

export enum AgentExceptionCode {
  AGENT_NOT_FOUND = 'AGENT_NOT_FOUND',
  AGENT_EXECUTION_FAILED = 'AGENT_EXECUTION_FAILED',
  API_KEY_NOT_CONFIGURED = 'API_KEY_NOT_CONFIGURED',
  USER_WORKSPACE_ID_NOT_FOUND = 'USER_WORKSPACE_ID_NOT_FOUND',
}
