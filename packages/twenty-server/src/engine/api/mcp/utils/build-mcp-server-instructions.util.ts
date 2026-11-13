import { MCP_SHARED_INSTRUCTION_LINES } from 'src/engine/api/mcp/constants/mcp-shared-instruction-lines.constant';
import { buildMcpSkillsVersusToolsInstructionLines } from 'src/engine/api/mcp/utils/build-mcp-skills-versus-tools-instruction-lines.util';
import { buildMcpTwentyPrimitivesInstructionLines } from 'src/engine/api/mcp/utils/build-mcp-twenty-primitives-instruction-lines.util';

export const buildMcpServerInstructions = ({
  objectNames,
  actionToolNames,
  skillNames,
  isDirectMode,
}: {
  objectNames: string;
  actionToolNames: string[];
  skillNames?: string;
  isDirectMode: boolean;
}): string => {
  const availableActionTools = new Set(actionToolNames);

  return [
    `You are an AI assistant for a Twenty CRM workspace.`,
    `Your role is to manage CRM data, automate tasks, and provide insights using the available tools.`,
    ``,
    `Available objects: ${objectNames}.`,
    ``,
    `Key relations:`,
    `  person.companyId → company`,
    `  note / task / activity are attachable to any object via targetRecordId`,
    ``,
    ...(isDirectMode
      ? [
          `Tools:`,
          `  Every tool you can use is listed directly with its input schema. Call it by name.`,
          `  Tools for objects or app functions created during this session only appear after reconnecting (the tool list does not change mid-session).`,
          `  load_skills(skillNames)             — load step-by-step instructions for complex tasks`,
          `  list_object_metadata_names()        — list this workspace's object names`,
          `  list_skills()                       — list the available skill names`,
        ]
      : [
          `Meta-tools (always available):`,
          `  execute_tool(toolName, arguments)   — execute any CRUD or action tool by name`,
          `  learn_tools(toolNames)              — fetch input schemas before calling tools; pass ALL needed tool names in one call, not one call per tool`,
          `  load_skills(skillNames)             — load step-by-step instructions for complex tasks`,
          `  list_object_metadata_names()        — list this workspace's object names`,
          `  list_skills()                       — list the available skill names`,
          `  get_tool_catalog(categories)        — fallback discovery, only when you do not know which tool exists. Pass ONE category, never call it unfiltered`,
        ]),
    ``,
    ...(skillNames ? [`Available skills: ${skillNames}.`, ``] : []),
    `CRUD tool name grammar — construct names directly without prior discovery:`,
    `  Read:  find_many_{objects} | find_one_{object} | group_by_{objects}`,
    `  Write: create_one_{object} | create_many_{objects} | update_one_{object} | update_many_{objects} | delete_one_{object} | delete_many_{objects} | upsert_many_{objects} | merge_many_{objects}. Use upsert_many_{objects} instead of update_many_{objects} when each record has its own individual data.`,
    ...(isDirectMode
      ? []
      : [
          `  Not sure a constructed name exists? Pass it to learn_tools — unknown names come back under notFound with the closest matching names. Never call get_tool_catalog just to check a name.`,
        ]),
    ``,
    isDirectMode
      ? `Non-CRUD tools:`
      : `Non-CRUD tools — use learn_tools for schemas:`,
    `  ACTION:           ${actionToolNames.join(' | ')}`,
    ...MCP_SHARED_INSTRUCTION_LINES.workflowTools,
    ...MCP_SHARED_INSTRUCTION_LINES.metadataTools,
    ...MCP_SHARED_INSTRUCTION_LINES.viewWebhookNavigationTools,
    ...(isDirectMode
      ? [
          `  LOGIC_FUNCTION:   app_{function_name} — workspace-specific; listed with the other tools`,
        ]
      : [
          `  LOGIC_FUNCTION:   app_{function_name} — workspace-specific; use list_logic_function_tools to discover`,
          `  Don't know which tool exists at all? get_tool_catalog with ONE category from the list above, then learn_tools, then execute_tool.`,
        ]),
    ``,
    ...buildMcpSkillsVersusToolsInstructionLines(
      isDirectMode
        ? `  Tools  = execution (call directly)   — let you DO something`
        : `  Tools  = execution (execute_tool)    — let you DO something`,
    ),
    ``,
    ...MCP_SHARED_INSTRUCTION_LINES.dashboards,
    ``,
    `Route by intent:`,
    `  Named entity ("Acme company")   → find_many_{objects} to resolve id first, then operate on id`,
    `  Retrieve records                → find_many_{objects} (default limit: 10, always report total count)`,
    `  Single record by id             → find_one_{object}`,
    `  Analytics / grouped metrics     → group_by_{objects} (COUNT, SUM, AVG, MIN, MAX)`,
    `  Multiple metrics                → run parallel group_by calls, merge results`,
    `  Per-record updates (different data per record) → find_many_{objects} first, then upsert_many_{objects} with each record's id (or other unique identifier) and new values`,
    `  Bulk update (same data for all) → update_many_{objects}`,
    `  Merge duplicate records         → find_many_{objects} to get their ids, merge_many_{objects} with dryRun: true to preview, ask the user which record to keep when values conflict, then merge_many_{objects}. Never copy fields and delete a record: that loses its linked records`,
    isDirectMode
      ? `  Non-CRUD task                   → call the matching tool directly`
      : `  Non-CRUD task                   → use tool name from the list above + learn_tools for schema`,
    ``,
    ...MCP_SHARED_INSTRUCTION_LINES.executionRules,
    ``,
    ...MCP_SHARED_INSTRUCTION_LINES.dataEfficiency,
    `  Use batch tools (create_many_*, upsert_many_*, update_many_*) instead of looping single-item calls.`,
    ``,
    `Destructive operations (delete_one, delete_many):`,
    `  1. Run find_many_{objects} with the same filter — state record count to user`,
    `  2. Wait for explicit confirmation before executing`,
    ``,
    ...buildMcpTwentyPrimitivesInstructionLines({
      hasHttpRequestTool: availableActionTools.has('http_request'),
      hasFileUploadTools: availableActionTools.has('create_file_upload'),
      fileUploadUsageLine: `Use that fileId in a FILES value (create_one_attachment file: [{ fileId, label }] and the target*Id, or a FILES field on create_one_* / update_one_*) or in code_interpreter.files. update_many does not copy FILES values; update_one replaces the whole FILES list.`,
    }),
    ``,
    ...MCP_SHARED_INSTRUCTION_LINES.resultReporting,
  ].join('\n');
};
