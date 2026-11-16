import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';
import { type McpToolTestData } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/types/McpToolTestData';

export const mcpToolTestDataFamilyState = createAtomFamilyState<
  McpToolTestData,
  string
>({
  key: 'mcpToolTestDataFamilyState',
  defaultValue: {
    variableValues: {},
    output: { status: 'idle' },
  },
});
