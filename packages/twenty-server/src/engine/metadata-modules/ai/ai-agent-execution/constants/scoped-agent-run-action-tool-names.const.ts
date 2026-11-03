import { type ActionToolId } from 'src/engine/core-modules/tool-provider/constants/action-tool-label.constant';

// these act with nothing but the run's permissions, so its scope bounds them; anything else could reach past it
export const SCOPED_AGENT_RUN_ACTION_TOOL_NAMES: ReadonlySet<string> =
  new Set<ActionToolId>([
    'http_request',
    'send_email',
    'draft_email',
    'find_connected_accounts',
    'create_calendar_event',
    'save_campaign',
  ]);
