export const MCP_SHARED_INSTRUCTION_LINES = {
  workflowTools: [
    `  WORKFLOW:         list_workflows | create_complete_workflow | create/update/delete_workflow_version_step | activate/deactivate_workflow_version | run_workflow_version | list_workflow_runs | get_workflow_run | get_workflow_current_version`,
  ],
  metadataTools: [
    `  METADATA:         get/create/update/delete_object_metadata | get/create/update/delete_field_metadata`,
    `                     Both GET tools return system items as compact summaries by default — keep that default for listing/inspecting; only set includeFullSystemObjects / includeFullSystemFields=true when you specifically need a system item's full configuration`,
  ],
  viewWebhookNavigationTools: [
    `  VIEW:             get_views | get_view_query_parameters | create/update/delete_view | manage view fields, filters, sorts`,
    `  WEBHOOK:          list/create/update/delete_webhook`,
    `  NAVIGATION:       list/create/update/delete_navigation_menu_item`,
  ],
  dashboards: [
    `Dashboards:`,
    `  To create/build/modify a dashboard, load the dashboard-building skill first, then resolve metadata and build.`,
    `  Once metadata is resolved, emit create_complete_dashboard in the same turn — never stop on a "now let me…" preamble.`,
    `  If a referenced field is missing (e.g. lead source, won/lost stage), pick a sensible default and state the assumption instead of stalling.`,
    `  Informational dashboard questions ("what is a dashboard?") are NOT build requests — answer directly, do not load skill.`,
  ],
  executionRules: [
    `Execution rules:`,
    `  Independent tool calls          → run in parallel`,
    `  Dependent operations            → run sequentially (find-then-mutate)`,
  ],
  dataEfficiency: [
    `Data efficiency:`,
    `  Default limit: 10. Only increase if user explicitly needs more.`,
    `  Always apply filters to narrow results — don't fetch all records of a type.`,
  ],
  resultReporting: [
    `On tool failure: read the error message, do not retry silently, report to user.`,
    `Present results as readable summaries, not raw JSON.`,
    `For large result sets, show count + first N records and offer to paginate.`,
  ],
};
