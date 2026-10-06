import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { type AgentRunCallerHandler } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-handler.type';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

// callers register here so the engine hands them their runs' outcomes without importing them
@Injectable()
export class AgentRunCallerHandlerRegistryService {
  private readonly handlers = new Map<
    AgentRunCaller['type'],
    AgentRunCallerHandler
  >();

  register(handler: AgentRunCallerHandler): void {
    this.handlers.set(handler.callerType, handler);
  }

  getHandlerOrThrow(callerType: AgentRunCaller['type']): AgentRunCallerHandler {
    const handler = this.handlers.get(callerType);

    if (!isDefined(handler)) {
      throw new AiException(
        `No handler is registered for ${callerType} agent runs`,
        AiExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    return handler;
  }
}
