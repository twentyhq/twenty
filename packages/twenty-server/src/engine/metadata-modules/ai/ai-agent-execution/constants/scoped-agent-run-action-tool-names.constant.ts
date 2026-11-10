import { type ActionToolId } from 'src/engine/core-modules/tool-provider/constants/action-tool-label.constant';

// these act with the run's permissions or the workspace's connected accounts; tools acting as the system or a member are left out
export const SCOPED_AGENT_RUN_ACTION_TOOL_NAMES: ReadonlySet<string> =
  new Set<ActionToolId>([
    'http_request',
    'send_email',
    'draft_email',
    'find_connected_accounts',
    'create_calendar_event',
    'save_campaign',
  ]);
