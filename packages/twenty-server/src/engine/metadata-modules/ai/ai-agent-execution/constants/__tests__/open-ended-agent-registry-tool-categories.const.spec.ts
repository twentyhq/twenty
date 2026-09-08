import { ToolCategory } from 'twenty-shared/ai';

import { OPEN_ENDED_AGENT_REGISTRY_TOOL_CATEGORIES } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/open-ended-agent-registry-tool-categories.const';
import { WORKFLOW_AGENT_REGISTRY_TOOL_CATEGORIES } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/workflow-agent-registry-tool-categories.const';

describe('OPEN_ENDED_AGENT_REGISTRY_TOOL_CATEGORIES', () => {
  it('exposes the permission-gated categories a member can reach in the app', () => {
    expect(OPEN_ENDED_AGENT_REGISTRY_TOOL_CATEGORIES).toContain(
      ToolCategory.DASHBOARD,
    );
    expect(OPEN_ENDED_AGENT_REGISTRY_TOOL_CATEGORIES).toContain(
      ToolCategory.WORKFLOW,
    );
  });

  it('keeps the categories that reshape the workspace out of reach', () => {
    expect(OPEN_ENDED_AGENT_REGISTRY_TOOL_CATEGORIES).toEqual(
      expect.not.arrayContaining([
        ToolCategory.METADATA,
        ToolCategory.ROLE,
        ToolCategory.WEBHOOK,
        ToolCategory.LOGIC_FUNCTION,
        ToolCategory.NAVIGATION_MENU_ITEM,
      ]),
    );
  });

  it('is a superset of the narrower workflow node categories', () => {
    expect(OPEN_ENDED_AGENT_REGISTRY_TOOL_CATEGORIES).toEqual(
      expect.arrayContaining(WORKFLOW_AGENT_REGISTRY_TOOL_CATEGORIES),
    );
  });
});
