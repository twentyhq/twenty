import { convertToModelMessages, type UIMessage } from 'ai';

import { type AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';
import { finalizeDanglingToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/finalize-dangling-tool-parts.util';
import { mapDBPartToUIMessagePart } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapDBPartToUIMessagePart';
import { mapUIMessagePartsToDBParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapUIMessagePartsToDBParts';

const toolPart = (state: string, overrides: Record<string, unknown>) =>
  ({
    type: 'tool-execute_tool',
    input: { name: 'nav item' },
    state,
    ...overrides,
  }) as unknown as UIMessage['parts'][number];

const persistAndReload = (parts: UIMessage['parts']): UIMessage['parts'] =>
  mapUIMessagePartsToDBParts(parts, 'message-1', 'workspace-1')
    .map((dbPart) => mapDBPartToUIMessagePart(dbPart as AgentMessagePartEntity))
    .filter((part): part is UIMessage['parts'][number] => part !== null);

const unresolvedToolCallIds = async (
  messages: UIMessage[],
): Promise<string[]> => {
  const modelMessages = await convertToModelMessages(messages);
  const pending = new Set<string>();

  for (const message of modelMessages) {
    if (!Array.isArray(message.content)) {
      continue;
    }

    for (const content of message.content) {
      if (typeof content !== 'object') {
        continue;
      }

      if (content.type === 'tool-call' && content.providerExecuted !== true) {
        pending.add(content.toolCallId);
      }

      if (content.type === 'tool-result') {
        pending.delete(content.toolCallId);
      }
    }
  }

  return [...pending];
};

const buildThread = (assistantParts: UIMessage['parts']): UIMessage[] => [
  { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'create 3 items' }] },
  { id: 'a1', role: 'assistant', parts: assistantParts },
  {
    id: 'u2',
    role: 'user',
    parts: [{ type: 'text', text: 'now revert them' }],
  },
];

describe('finalizeDanglingToolParts round-trip', () => {
  const interruptedBatch: UIMessage['parts'] = [
    { type: 'text', text: 'Creating items…' },
    toolPart('output-available', {
      toolCallId: 'done_1',
      output: { success: true },
    }),
    toolPart('input-available', { toolCallId: 'pending_1' }),
    toolPart('input-available', { toolCallId: 'pending_2' }),
  ];

  it('reproduces the bug: an interrupted batch leaves tool calls unresolved', async () => {
    expect(await unresolvedToolCallIds(buildThread(interruptedBatch))).toEqual([
      'pending_1',
      'pending_2',
    ]);
  });

  it('resolves every tool call after finalize + persistence round-trip', async () => {
    const reloaded = persistAndReload(
      finalizeDanglingToolParts(interruptedBatch),
    );

    expect(await unresolvedToolCallIds(buildThread(reloaded))).toEqual([]);
  });

  it('preserves the completed tool result through the round-trip', async () => {
    const reloaded = persistAndReload(
      finalizeDanglingToolParts(interruptedBatch),
    );
    const toolResults = (await convertToModelMessages(buildThread(reloaded)))
      .filter((message) => message.role === 'tool')
      .flatMap((message) =>
        Array.isArray(message.content) ? message.content : [],
      );

    expect(toolResults).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          toolCallId: 'done_1',
          output: expect.objectContaining({ value: { success: true } }),
        }),
      ]),
    );
  });
});
