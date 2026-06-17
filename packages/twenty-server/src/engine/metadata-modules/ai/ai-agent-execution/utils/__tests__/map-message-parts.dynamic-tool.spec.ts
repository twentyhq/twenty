import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { type AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';
import { mapDBPartToUIMessagePart } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapDBPartToUIMessagePart';
import { mapUIMessagePartsToDBParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapUIMessagePartsToDBParts';

// Reported in https://github.com/twentyhq/twenty/issues/20558:
// the AI SDK emits `dynamic-tool` parts for tools the model invokes that
// aren't part of the bound schema. The mapper used to throw on them.

const dynamicToolPart = (
  overrides: Record<string, unknown> = {},
): ExtendedUIMessagePart =>
  ({
    type: 'dynamic-tool',
    toolName: 'unknown_remote_tool',
    toolCallId: 'call_dyn_1',
    state: 'output-available',
    input: { query: 'hello' },
    output: { ok: true },
    ...overrides,
  }) as unknown as ExtendedUIMessagePart;

const staticToolPart = (
  overrides: Record<string, unknown> = {},
): ExtendedUIMessagePart =>
  ({
    type: 'tool-execute_tool',
    toolCallId: 'call_static_1',
    state: 'output-available',
    input: { name: 'foo' },
    output: { ok: true },
    ...overrides,
  }) as unknown as ExtendedUIMessagePart;

describe('AgentMessagePart mappers — dynamic-tool support', () => {
  it('persists a dynamic-tool part without throwing', () => {
    expect(() =>
      mapUIMessagePartsToDBParts(
        [dynamicToolPart()],
        'message-1',
        'workspace-1',
      ),
    ).not.toThrow();
  });

  it('stores the tool name on the row for dynamic-tool parts', () => {
    const [row] = mapUIMessagePartsToDBParts(
      [dynamicToolPart()],
      'message-1',
      'workspace-1',
    );

    expect(row).toMatchObject({
      type: 'dynamic-tool',
      toolName: 'unknown_remote_tool',
      toolCallId: 'call_dyn_1',
      toolInput: { query: 'hello' },
      toolOutput: { ok: true },
    });
  });

  it('stores the tool name on the row for static tool parts', () => {
    const [row] = mapUIMessagePartsToDBParts(
      [staticToolPart()],
      'message-1',
      'workspace-1',
    );

    expect(row).toMatchObject({
      type: 'tool-execute_tool',
      toolName: 'execute_tool',
      toolCallId: 'call_static_1',
    });
  });

  it('round-trips a dynamic-tool part through DB and back', () => {
    const original = dynamicToolPart();

    const [row] = mapUIMessagePartsToDBParts(
      [original],
      'message-1',
      'workspace-1',
    );
    const reloaded = mapDBPartToUIMessagePart(row as AgentMessagePartEntity);

    expect(reloaded).toEqual({
      type: 'dynamic-tool',
      toolName: 'unknown_remote_tool',
      toolCallId: 'call_dyn_1',
      input: { query: 'hello' },
      output: { ok: true },
      errorText: '',
      state: 'output-available',
    });
  });

  it('round-trips a static tool part through DB and back', () => {
    const original = staticToolPart();

    const [row] = mapUIMessagePartsToDBParts(
      [original],
      'message-1',
      'workspace-1',
    );
    const reloaded = mapDBPartToUIMessagePart(row as AgentMessagePartEntity);

    expect(reloaded).toMatchObject({
      type: 'tool-execute_tool',
      toolCallId: 'call_static_1',
      input: { name: 'foo' },
      output: { ok: true },
    });
    expect(reloaded).not.toHaveProperty('toolName');
  });
});
