import { type ActionToolId } from 'src/engine/core-modules/tool-provider/constants/action-tool-label.constant';
import { type OUTPUT_NAVIGATION_TOOL_NAMES } from 'src/engine/core-modules/tool/tools/output-navigation-tool/constants/output-navigation-tool-names.constant';

// true when the tool's only authorization is the caller's config (a permission flag, or record writes with it)
export const ACTION_TOOL_CAN_RUN_UNDER_SCOPE: Record<
  ActionToolId | (typeof OUTPUT_NAVIGATION_TOOL_NAMES)[number],
  boolean
> = {
  http_request: true,
  send_email: true,
  draft_email: true,
  find_connected_accounts: true,
  create_calendar_event: true,
  search_help_center: true,
  save_campaign: true,
  create_file_upload: true,
  complete_file_upload: true,
  extract_json_paths: true,
  search_output: true,
  // calls back into the API with a token for the member, which cannot carry a scope
  code_interpreter: false,
  // checks the member's own permissions on the record
  share_record: false,
};
