import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum AgentExceptionCode {
  AGENT_NOT_FOUND = 'AGENT_NOT_FOUND',
  AGENT_EXECUTION_FAILED = 'AGENT_EXECUTION_FAILED',
  API_KEY_NOT_CONFIGURED = 'API_KEY_NOT_CONFIGURED',
  USER_WORKSPACE_ID_NOT_FOUND = 'USER_WORKSPACE_ID_NOT_FOUND',
  ROLE_NOT_FOUND = 'ROLE_NOT_FOUND',
  ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS = 'ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS',
  INVALID_AGENT_INPUT = 'INVALID_AGENT_INPUT',
  AGENT_ALREADY_EXISTS = 'AGENT_ALREADY_EXISTS',
  AGENT_IS_STANDARD = 'AGENT_IS_STANDARD',
}

const getAgentExceptionUserFriendlyMessage = (code: AgentExceptionCode) => {
  switch (code) {
    case AgentExceptionCode.AGENT_NOT_FOUND:
      return msg`Agent not found.`;
    case AgentExceptionCode.AGENT_EXECUTION_FAILED:
      return msg`Agent execution failed.`;
    case AgentExceptionCode.API_KEY_NOT_CONFIGURED:
      return msg`API key is not configured.`;
    case AgentExceptionCode.USER_WORKSPACE_ID_NOT_FOUND:
      return msg`User workspace not found.`;
    case AgentExceptionCode.ROLE_NOT_FOUND:
      return msg`Role not found.`;
    case AgentExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS:
      return msg`This role cannot be assigned to agents.`;
    case AgentExceptionCode.INVALID_AGENT_INPUT:
      return msg`Invalid agent input.`;
    case AgentExceptionCode.AGENT_ALREADY_EXISTS:
      return msg`An agent with this name already exists.`;
    case AgentExceptionCode.AGENT_IS_STANDARD:
      return msg`Standard agents cannot be modified.`;
    default:
      assertUnreachable(code);
  }
};

export class AgentException extends CustomException<AgentExceptionCode> {
  constructor(
    message: string,
    code: AgentExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getAgentExceptionUserFriendlyMessage(code),
    });
  }
}
