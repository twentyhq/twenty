import { GraphQLISODateTime } from '@nestjs/graphql';
import { AgentChatThreadResolver } from 'src/engine/metadata-modules/ai/ai-chat/resolvers/agent-chat-thread.resolver';
import { AgentMessageResolver } from 'src/engine/metadata-modules/ai/ai-agent-execution/resolvers/agent-message.resolver';
import { AgentMessagePartResolver } from 'src/engine/metadata-modules/ai/ai-agent-execution/resolvers/agent-message-part.resolver';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';

const timestamp = '2026-09-27T12:00:00.000Z';

it('serializes native workspace timestamps through the existing GraphQL Date scalar', () => {
  const thread = {
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: timestamp,
  } as AgentChatThreadWorkspaceEntity;
  const message = {
    createdAt: timestamp,
    processedAt: timestamp,
  } as AgentMessageWorkspaceEntity;
  const part = { createdAt: timestamp } as AgentMessagePartWorkspaceEntity;
  const values = [
    AgentChatThreadResolver.prototype.createdAt(thread),
    AgentChatThreadResolver.prototype.updatedAt(thread),
    AgentChatThreadResolver.prototype.deletedAt(thread),
    AgentMessageResolver.prototype.createdAt(message),
    AgentMessageResolver.prototype.processedAt(message),
    AgentMessagePartResolver.prototype.createdAt(part),
  ];
  expect(values.map((value) => GraphQLISODateTime.serialize(value))).toEqual(
    Array(6).fill(timestamp),
  );
  expect(
    AgentChatThreadResolver.prototype.deletedAt({
      ...thread,
      deletedAt: null,
      archivedAt: timestamp,
    }),
  ).toBeNull();
  expect(
    AgentMessageResolver.prototype.processedAt({
      ...message,
      processedAt: null,
    }),
  ).toBeNull();
});

it('converts exact stored credit strings to display credits only at the API boundary', () => {
  const thread = {
    totalInputCredits: '12345',
    totalOutputCredits: '67890',
  } as AgentChatThreadWorkspaceEntity;
  expect(AgentChatThreadResolver.prototype.totalInputCredits(thread)).toBe(
    0.012345,
  );
  expect(AgentChatThreadResolver.prototype.totalOutputCredits(thread)).toBe(
    0.06789,
  );
});
