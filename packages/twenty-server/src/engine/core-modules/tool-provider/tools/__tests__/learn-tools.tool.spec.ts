import { type ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { createLearnToolsTool } from 'src/engine/core-modules/tool-provider/tools/learn-tools.tool';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';

describe('createLearnToolsTool', () => {
  const context = {} as ToolContext;

  it('surfaces "did you mean" suggestions when a tool name is not found', async () => {
    const toolRegistry = {
      getToolInfo: jest.fn().mockResolvedValue([]),
      suggestSimilarToolNames: jest
        .fn()
        .mockResolvedValue({ group_by_person: ['group_by_people'] }),
    } as unknown as ToolRegistryService;

    const learnTools = createLearnToolsTool(toolRegistry, context);

    const result = await learnTools.execute({
      toolNames: ['group_by_person'],
      aspects: ['description', 'schema'],
    });

    expect(result.notFound).toEqual(['group_by_person']);
    expect(result.suggestions).toEqual({
      group_by_person: ['group_by_people'],
    });
    expect(result.message).toContain(
      'group_by_person (did you mean: group_by_people?)',
    );
  });

  it('does not look up suggestions when every tool resolves', async () => {
    const suggestSimilarToolNames = jest.fn();
    const toolRegistry = {
      getToolInfo: jest
        .fn()
        .mockResolvedValue([
          { name: 'group_by_people', description: 'Group people' },
        ]),
      suggestSimilarToolNames,
    } as unknown as ToolRegistryService;

    const learnTools = createLearnToolsTool(toolRegistry, context);

    const result = await learnTools.execute({
      toolNames: ['group_by_people'],
      aspects: ['description'],
    });

    expect(result.notFound).toEqual([]);
    expect(result.suggestions).toBeUndefined();
    expect(suggestSimilarToolNames).not.toHaveBeenCalled();
    expect(result.message).toBe('Learned 1 tool: group_by_people.');
  });

  it('pluralizes the learned-tools count', async () => {
    const toolRegistry = {
      getToolInfo: jest
        .fn()
        .mockResolvedValue([
          { name: 'find_many_people' },
          { name: 'group_by_people' },
        ]),
      suggestSimilarToolNames: jest.fn(),
    } as unknown as ToolRegistryService;

    const learnTools = createLearnToolsTool(toolRegistry, context);

    const result = await learnTools.execute({
      toolNames: ['find_many_people', 'group_by_people'],
      aspects: ['description'],
    });

    expect(result.message).toBe(
      'Learned 2 tools: find_many_people, group_by_people.',
    );
  });

  it('does not report excluded tools as not found or suggest alternatives', async () => {
    const suggestSimilarToolNames = jest.fn();
    const toolRegistry = {
      getToolInfo: jest.fn().mockResolvedValue([]),
      suggestSimilarToolNames,
    } as unknown as ToolRegistryService;

    const learnTools = createLearnToolsTool(toolRegistry, context, {
      excludeTools: new Set(['code_interpreter']),
    });

    const result = await learnTools.execute({
      toolNames: ['code_interpreter'],
      aspects: ['description'],
    });

    expect(toolRegistry.getToolInfo).toHaveBeenCalledWith([], context, [
      'description',
    ]);
    expect(result.notFound).toEqual([]);
    expect(result.suggestions).toBeUndefined();
    expect(suggestSimilarToolNames).not.toHaveBeenCalled();
    expect(result.message).toBe('No matching tools found.');
  });

  it('does not consult the spill service when spillLargeOutput is not set', async () => {
    const spillToolOutputIfTooLarge = jest.fn();
    const toolRegistry = {
      getToolInfo: jest
        .fn()
        .mockResolvedValue([
          { name: 'find_many_people', inputSchema: { type: 'object' } },
        ]),
      suggestSimilarToolNames: jest.fn(),
      spillToolOutputIfTooLarge,
    } as unknown as ToolRegistryService;

    const learnTools = createLearnToolsTool(toolRegistry, context);

    await learnTools.execute({
      toolNames: ['find_many_people'],
      aspects: ['schema'],
    });

    expect(spillToolOutputIfTooLarge).not.toHaveBeenCalled();
  });

  it('keeps tools inline when the spill service leaves the output untouched', async () => {
    const spillToolOutputIfTooLarge = jest
      .fn()
      .mockImplementation((output) => Promise.resolve(output));
    const toolRegistry = {
      getToolInfo: jest
        .fn()
        .mockResolvedValue([
          { name: 'find_many_people', inputSchema: { type: 'object' } },
        ]),
      suggestSimilarToolNames: jest.fn(),
      spillToolOutputIfTooLarge,
    } as unknown as ToolRegistryService;

    const learnTools = createLearnToolsTool(toolRegistry, context, {
      spillLargeOutput: true,
    });

    const result = await learnTools.execute({
      toolNames: ['find_many_people'],
      aspects: ['schema'],
    });

    expect(spillToolOutputIfTooLarge).toHaveBeenCalledWith(
      {
        success: true,
        message: 'Learned 1 tool: find_many_people.',
        result: {
          tools: [
            { name: 'find_many_people', inputSchema: { type: 'object' } },
          ],
        },
      },
      context,
      'learn_tools',
    );
    expect(result.tools).toEqual([
      { name: 'find_many_people', inputSchema: { type: 'object' } },
    ]);
    expect(result.spilledTools).toBeUndefined();
    expect(result.warnings).toBeUndefined();
  });

  it('spills bulky schemas while keeping message, notFound and suggestions inline', async () => {
    const spillEnvelope = {
      spilled: true,
      outputRef: {
        fileId: 'file-1',
        filename: 'tool-output-learn_tools-file-1.json',
      },
      preview: { tools: ['...'] },
      hint: 'use extract_json_paths',
    };
    const spillToolOutputIfTooLarge = jest.fn().mockResolvedValue({
      success: true,
      message: 'Learned 1 tool: find_many_people.',
      result: spillEnvelope,
    });
    const toolRegistry = {
      getToolInfo: jest
        .fn()
        .mockResolvedValue([
          { name: 'find_many_people', inputSchema: { type: 'object' } },
        ]),
      suggestSimilarToolNames: jest
        .fn()
        .mockResolvedValue({ group_by_person: ['group_by_people'] }),
      spillToolOutputIfTooLarge,
    } as unknown as ToolRegistryService;

    const learnTools = createLearnToolsTool(toolRegistry, context, {
      spillLargeOutput: true,
    });

    const result = await learnTools.execute({
      toolNames: ['find_many_people', 'group_by_person'],
      aspects: ['description', 'schema'],
    });

    expect(result.tools).toEqual([]);
    expect(result.spilledTools).toEqual(spillEnvelope);
    expect(result.notFound).toEqual(['group_by_person']);
    expect(result.suggestions).toEqual({
      group_by_person: ['group_by_people'],
    });
    expect(result.message).toContain('Learned 1 tool: find_many_people');
    expect(result.message).toContain(
      'group_by_person (did you mean: group_by_people?)',
    );
  });

  it('surfaces spill warnings when the spill service degrades to truncation', async () => {
    const spillToolOutputIfTooLarge = jest.fn().mockResolvedValue({
      success: true,
      message: 'Learned 1 tool: find_many_people.',
      result: { truncated: true, originalSizeBytes: 90000, content: '...' },
      warnings: ['Large output spill failed; the output was truncated inline.'],
    });
    const toolRegistry = {
      getToolInfo: jest
        .fn()
        .mockResolvedValue([
          { name: 'find_many_people', inputSchema: { type: 'object' } },
        ]),
      suggestSimilarToolNames: jest.fn(),
      spillToolOutputIfTooLarge,
    } as unknown as ToolRegistryService;

    const learnTools = createLearnToolsTool(toolRegistry, context, {
      spillLargeOutput: true,
    });

    const result = await learnTools.execute({
      toolNames: ['find_many_people'],
      aspects: ['schema'],
    });

    expect(result.tools).toEqual([]);
    expect(result.spilledTools).toEqual({
      truncated: true,
      originalSizeBytes: 90000,
      content: '...',
    });
    expect(result.warnings).toEqual([
      'Large output spill failed; the output was truncated inline.',
    ]);
  });
});
