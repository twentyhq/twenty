import { extractSharedDefs } from 'src/engine/core-modules/tool-provider/utils/extract-shared-defs.util';

describe('extractSharedDefs', () => {
  const workflowActionDef = {
    id: 'WorkflowAction',
    anyOf: [{ type: 'object' }],
  };

  it('should hoist identical $defs shared by several tools', () => {
    const tools = [
      {
        name: 'update_workflow_version_step',
        inputSchema: {
          type: 'object',
          properties: { step: { $ref: '#/$defs/WorkflowAction' } },
          $defs: { WorkflowAction: workflowActionDef },
        },
      },
      {
        name: 'create_complete_workflow',
        inputSchema: {
          type: 'object',
          properties: {
            steps: { type: 'array', items: { $ref: '#/$defs/WorkflowAction' } },
          },
          $defs: { WorkflowAction: workflowActionDef },
        },
      },
    ];

    const { tools: dedupedTools, sharedDefs } = extractSharedDefs(tools);

    expect(sharedDefs).toEqual({ WorkflowAction: workflowActionDef });
    expect(dedupedTools[0].inputSchema).not.toHaveProperty('$defs');
    expect(dedupedTools[1].inputSchema).not.toHaveProperty('$defs');
    expect(dedupedTools[0].inputSchema).toHaveProperty('properties');
  });

  it('should not hoist defs used by a single tool', () => {
    const tools = [
      {
        name: 'tool_a',
        inputSchema: {
          type: 'object',
          $defs: { OnlyHere: { type: 'string' } },
        },
      },
      {
        name: 'tool_b',
        inputSchema: { type: 'object' },
      },
    ];

    const { tools: dedupedTools, sharedDefs } = extractSharedDefs(tools);

    expect(sharedDefs).toEqual({});
    expect(dedupedTools[0].inputSchema).toEqual({
      type: 'object',
      $defs: { OnlyHere: { type: 'string' } },
    });
  });

  it('should not hoist same-named defs with different content', () => {
    const tools = [
      {
        name: 'tool_a',
        inputSchema: { type: 'object', $defs: { Thing: { type: 'string' } } },
      },
      {
        name: 'tool_b',
        inputSchema: { type: 'object', $defs: { Thing: { type: 'number' } } },
      },
    ];

    const { tools: dedupedTools, sharedDefs } = extractSharedDefs(tools);

    expect(sharedDefs).toEqual({});
    expect(dedupedTools[0].inputSchema).toEqual({
      type: 'object',
      $defs: { Thing: { type: 'string' } },
    });
    expect(dedupedTools[1].inputSchema).toEqual({
      type: 'object',
      $defs: { Thing: { type: 'number' } },
    });
  });

  it('should keep non-shared defs in place while hoisting shared ones', () => {
    const sharedDef = { type: 'string' };
    const tools = [
      {
        name: 'tool_a',
        inputSchema: {
          type: 'object',
          $defs: { Shared: sharedDef, LocalA: { type: 'boolean' } },
        },
      },
      {
        name: 'tool_b',
        inputSchema: { type: 'object', $defs: { Shared: sharedDef } },
      },
    ];

    const { tools: dedupedTools, sharedDefs } = extractSharedDefs(tools);

    expect(sharedDefs).toEqual({ Shared: sharedDef });
    expect(dedupedTools[0].inputSchema).toEqual({
      type: 'object',
      $defs: { LocalA: { type: 'boolean' } },
    });
    expect(dedupedTools[1].inputSchema).toEqual({ type: 'object' });
  });

  it('should handle tools without inputSchema', () => {
    const tools = [
      { name: 'tool_a' },
      { name: 'tool_b', inputSchema: { type: 'object' } },
    ];

    const { tools: dedupedTools, sharedDefs } = extractSharedDefs(tools);

    expect(sharedDefs).toEqual({});
    expect(dedupedTools).toEqual(tools);
  });
});
