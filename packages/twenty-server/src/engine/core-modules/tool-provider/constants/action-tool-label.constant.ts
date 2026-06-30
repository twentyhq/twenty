import { msg } from '@lingui/core/macro';

import { type ActionToolLabel } from 'src/engine/core-modules/tool-provider/types/action-tool-label.type';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

export const ACTION_TOOL_IDS = [
  'http_request',
  'send_email',
  'draft_email',
  'create_calendar_event',
  'search_help_center',
  'code_interpreter',
  'navigate_app',
] as const;

export type ActionToolId = (typeof ACTION_TOOL_IDS)[number];

export const ACTION_TOOL_LABELS: Record<ActionToolId, ActionToolLabel> = {
  http_request: {
    label: i18nLabel(msg`HTTP Request`),
  },
  send_email: {
    label: i18nLabel(msg`Send Email`),
  },
  draft_email: {
    label: i18nLabel(msg`Draft Email`),
  },
  create_calendar_event: {
    label: i18nLabel(msg`Create Calendar Event`),
  },
  search_help_center: {
    label: i18nLabel(msg`Search Help Center`),
  },
  code_interpreter: {
    label: i18nLabel(msg`Code Interpreter`),
  },
  navigate_app: {
    label: i18nLabel(msg`Navigate App`),
  },
};
