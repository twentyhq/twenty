import { MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-closed-world-read-only-tool-annotations.constant';
import { MCP_OPEN_WORLD_READ_ONLY_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-open-world-read-only-tool-annotations.constant';
import { type McpToolAnnotations } from 'src/engine/api/mcp/types/mcp-tool-annotations.type';

export const MCP_STATIC_TOOL_ANNOTATIONS: Record<string, McpToolAnnotations> = {
  find_campaign_suppressions: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  find_connected_accounts: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  get_dashboard: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  get_field_metadata: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  get_logic_function_source: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  get_object_metadata: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  get_validation_rules: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  get_view_fields: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  get_view_filters: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  get_view_query_parameters: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  get_view_sorts: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  get_views: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  get_workflow_current_version: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  get_workflow_run: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  list_agents: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  list_dashboards: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  list_logic_function_tools: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  list_navigation_menu_items: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  list_record_page_layouts: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  list_roles: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  list_webhooks: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  list_workflow_runs: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  list_workflows: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  preview_campaign_send: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  search_help_center: MCP_OPEN_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  validate_validation_rule_expression:
    MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  validate_workflow: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
};
