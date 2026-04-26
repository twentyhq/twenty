import { Injectable } from '@nestjs/common';

import * as Sentry from '@sentry/node';

import { type AiCallContext } from 'src/engine/metadata-modules/ai/ai-call-context/types/ai-call-context.type';

@Injectable()
export class AiCallContextService {
  // Applies the AI call context to the currently active Sentry isolation scope.
  // Use at HTTP/GraphQL boundaries — Sentry creates the per-request scope
  // automatically on Node 22.12+ when initialized before the HTTP server.
  setContext(context: AiCallContext): void {
    applyContext(context);
  }

  // Forks a Sentry isolation scope and applies the AI call context inside it.
  // Use at non-request boundaries (queue jobs, scheduled tasks) where Sentry
  // does not automatically isolate.
  withContext<T>(context: AiCallContext, fn: () => Promise<T>): Promise<T> {
    return Sentry.withIsolationScope(async () => {
      applyContext(context);

      return fn();
    });
  }
}

const applyContext = (context: AiCallContext): void => {
  // Primary identifier — use the actual user when available, workspace as fallback
  Sentry.setUser({
    id: context.userWorkspaceId ?? context.workspaceId,
  });

  // Filterable tags in the Sentry UI
  Sentry.setTag('twenty.workspace.id', context.workspaceId);
  if (context.userWorkspaceId) {
    Sentry.setTag('twenty.user_workspace.id', context.userWorkspaceId);
  }
  if (context.agentId) {
    Sentry.setTag('twenty.agent.id', context.agentId);
  }
  if (context.workflowRunId) {
    Sentry.setTag('twenty.workflow_run.id', context.workflowRunId);
  }
  if (context.turnId) {
    Sentry.setTag('twenty.turn.id', context.turnId);
  }
  if (context.threadId) {
    Sentry.setTag('twenty.thread.id', context.threadId);
  }

  // Structured context blob on events; also read back inside beforeSendSpan
  // to attach attributes to gen_ai spans.
  Sentry.setContext('twenty', buildContextPayload(context));
};

const buildContextPayload = (
  context: AiCallContext,
): Record<string, string> => {
  const payload: Record<string, string> = {
    workspace_id: context.workspaceId,
  };

  if (context.userWorkspaceId) {
    payload.user_workspace_id = context.userWorkspaceId;
  }
  if (context.agentId) {
    payload.agent_id = context.agentId;
  }
  if (context.workflowRunId) {
    payload.workflow_run_id = context.workflowRunId;
  }
  if (context.threadId) {
    payload.thread_id = context.threadId;
  }
  if (context.turnId) {
    payload.turn_id = context.turnId;
  }

  return payload;
};
