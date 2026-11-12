import { settings } from 'src/engine/constants/settings';

export const MCP_WORKFLOW_TOOLS_INSTRUCTION_LINE = `  WORKFLOW:         list_workflows | create_complete_workflow | create/update/delete_workflow_version_step | activate/deactivate_workflow_version | run_workflow_version | list_workflow_runs | get_workflow_run | get_workflow_current_version`;

export const MCP_METADATA_TOOLS_INSTRUCTION_LINES = [
  `  METADATA:         get/create/update/delete_object_metadata | get/create/update/delete_field_metadata`,
  `                     Both GET tools return system items as compact summaries by default — keep that default for listing/inspecting; only set includeFullSystemObjects / includeFullSystemFields=true when you specifically need a system item's full configuration`,
];

export const MCP_VIEW_WEBHOOK_NAVIGATION_TOOLS_INSTRUCTION_LINES = [
  `  VIEW:             get_views | get_view_query_parameters | create/update/delete_view | manage view fields, filters, sorts`,
  `  WEBHOOK:          list/create/update/delete_webhook`,
  `  NAVIGATION:       list/create/update/delete_navigation_menu_item`,
];

export const buildMcpSkillsVersusToolsInstructionLines = (
  toolsExecutionLine: string,
): string[] => [
  `Skills vs Tools:`,
  `  Skills = documentation (load_skills) — teach HOW to do something, correct schemas and patterns`,
  toolsExecutionLine,
  `  For complex tasks (workflows, metadata), load the matching skill BEFORE calling tools.`,
  `  ⚠️ Never call workflow or metadata tools without loading their skill first.`,
];

export const MCP_DASHBOARD_INSTRUCTION_LINES = [
  `Dashboards:`,
  `  To create/build/modify a dashboard, load the dashboard-building skill first, then resolve metadata and build.`,
  `  Once metadata is resolved, emit create_complete_dashboard in the same turn — never stop on a "now let me…" preamble.`,
  `  If a referenced field is missing (e.g. lead source, won/lost stage), pick a sensible default and state the assumption instead of stalling.`,
  `  Informational dashboard questions ("what is a dashboard?") are NOT build requests — answer directly, do not load skill.`,
];

export const MCP_EXECUTION_RULES_INSTRUCTION_LINES = [
  `Execution rules:`,
  `  Independent tool calls          → run in parallel`,
  `  Dependent operations            → run sequentially (find-then-mutate)`,
];

export const MCP_DATA_EFFICIENCY_INSTRUCTION_LINES = [
  `Data efficiency:`,
  `  Default limit: 10. Only increase if user explicitly needs more.`,
  `  Always apply filters to narrow results — don't fetch all records of a type.`,
];

export const buildMcpTwentyPrimitivesInstructionLines = ({
  hasHttpRequestTool,
  hasFileUploadTools,
  fileUploadUsageLine,
}: {
  hasHttpRequestTool: boolean;
  hasFileUploadTools: boolean;
  fileUploadUsageLine: string;
}): string[] => [
  `Twenty primitives:`,
  `  Favorites are navigation menu items. To favorite something, call create_navigation_menu_item with scope: 'user'.`,
  `  A default OBJECT navigation item is auto-created with create_object_metadata — do not add another.`,
  ...(hasHttpRequestTool
    ? [
        `  http_request is ONLY for external third-party APIs, never for Twenty's own data.`,
      ]
    : []),
  ...(hasFileUploadTools
    ? [
        `  To attach a file: create_file_upload ({ filename, size }), PUT the bytes to uploadUrl with Content-Type contentType (max ${settings.storage.maxDirectUploadFileSize}), then complete_file_upload ({ fileId }). ${fileUploadUsageLine}`,
      ]
    : []),
];

export const MCP_RESULT_REPORTING_INSTRUCTION_LINES = [
  `On tool failure: read the error message, do not retry silently, report to user.`,
  `Present results as readable summaries, not raw JSON.`,
  `For large result sets, show count + first N records and offer to paginate.`,
];
