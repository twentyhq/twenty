import { type ToolSet } from 'ai';
import { z } from 'zod';

import { ToolCategory } from 'twenty-shared/ai';

import { toolSetToDescriptors } from 'src/engine/core-modules/tool-provider/utils/tool-set-to-descriptors.util';

const createMockToolSet = (
  tools: Record<string, { description?: string; inputSchema?: z.ZodType }>,
): ToolSet => {
  const toolSet: ToolSet = {};

  for (const [name, def] of Object.entries(tools)) {
    toolSet[name] = {
      description: def.description,
      inputSchema: def.inputSchema ?? z.object({}),
      execute: async () => ({}),
    };
  }

  return toolSet;
};

describe('toolSetToDescriptors', () => {
  it('generates a humanized label when no labels map is provided', () => {
    const toolSet = createMockToolSet({
      create_complete_workflow: { description: 'Create a workflow' },
      get_object_metadata: { description: 'Get object metadata' },
    });

    const descriptors = toolSetToDescriptors(toolSet, ToolCategory.WORKFLOW, {
      includeSchemas: false,
    });

    const labelByName = new Map(descriptors.map((d) => [d.name, d.label]));

    expect(labelByName.get('create_complete_workflow')).toBe(
      'Create Complete Workflow',
    );
    expect(labelByName.get('get_object_metadata')).toBe('Get Object Metadata');
  });

  it('uses labels from the provided map when available', () => {
    const toolSet = createMockToolSet({
      create_complete_workflow: { description: 'Create a workflow' },
      activate_workflow_version: { description: 'Activate a workflow version' },
    });

    const descriptors = toolSetToDescriptors(toolSet, ToolCategory.WORKFLOW, {
      includeSchemas: false,
      labels: {
        create_complete_workflow: 'Create Workflow',
      },
    });

    const labelByName = new Map(descriptors.map((d) => [d.name, d.label]));

    expect(labelByName.get('create_complete_workflow')).toBe('Create Workflow');
    expect(labelByName.get('activate_workflow_version')).toBe(
      'Activate Workflow Version',
    );
  });

  it('includes label on every descriptor', () => {
    const toolSet = createMockToolSet({
      tool_a: { description: 'A' },
      tool_b: { description: 'B' },
      tool_c: { description: 'C' },
    });

    const descriptors = toolSetToDescriptors(toolSet, ToolCategory.ACTION, {
      includeSchemas: false,
    });

    for (const descriptor of descriptors) {
      expect(descriptor.label).toBeDefined();
      expect(descriptor.label.length).toBeGreaterThan(0);
    }
  });
});
