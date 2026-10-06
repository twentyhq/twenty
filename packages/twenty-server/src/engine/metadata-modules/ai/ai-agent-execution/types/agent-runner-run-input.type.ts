import { type ToolSet } from 'ai';
import { type ActorMetadata } from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { type AgentRunConversation } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-conversation.type';
import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';

export type AgentRunnerRunInput = {
  workspaceId: string;
  conversation: AgentRunConversation;
  caller: AgentRunCaller;
  title: string;
  agent: AgentEntity | null;
  // absent when continuing a paused run, whose answer is already the last message
  prompt: string | null;
  createdBy: ActorMetadata;
  baseSystemPrompt: string;
  pausingTools: ToolSet;
  canProposeToolCalls: boolean;
  authContext: WorkspaceAuthContext;
  actorContext?: ActorMetadata;
  userWorkspaceId: string | null;
  additionalRoleRestrictionIds?: string[];
  additionalExcludedToolNames?: readonly string[];
};
