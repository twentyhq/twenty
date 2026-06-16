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
    expect(result.message).toBe('Learned 1 tool(s): group_by_people.');
  });
});
