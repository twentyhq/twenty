import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

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

const agentExceptionUserFriendlyMessages: Record<
  AgentExceptionCode,
  MessageDescriptor
> = {
  [AgentExceptionCode.AGENT_NOT_FOUND]: msg`Agent not found.`,
  [AgentExceptionCode.AGENT_EXECUTION_FAILED]: msg`Agent execution failed.`,
  [AgentExceptionCode.API_KEY_NOT_CONFIGURED]: msg`API key is not configured.`,
  [AgentExceptionCode.USER_WORKSPACE_ID_NOT_FOUND]: msg`User workspace not found.`,
  [AgentExceptionCode.ROLE_NOT_FOUND]: msg`Role not found.`,
  [AgentExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS]: msg`This role cannot be assigned to agents.`,
  [AgentExceptionCode.INVALID_AGENT_INPUT]: msg`Invalid agent input.`,
  [AgentExceptionCode.AGENT_ALREADY_EXISTS]: msg`An agent with this name already exists.`,
  [AgentExceptionCode.AGENT_IS_STANDARD]: msg`Standard agents cannot be modified.`,
};

export class AgentException extends CustomException<AgentExceptionCode> {
  constructor(
    message: string,
    code: AgentExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? agentExceptionUserFriendlyMessages[code],
    });
  }
}
