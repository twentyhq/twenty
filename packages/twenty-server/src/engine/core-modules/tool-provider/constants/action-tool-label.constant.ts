import { msg } from '@lingui/core/macro';

import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

type ActionToolLabel = {
  label: string;
};

export const ACTION_TOOL_LABELS: Record<string, ActionToolLabel> = {
  http_request: {
    label: i18nLabel(msg`HTTP Request`),
  },
  send_email: {
    label: i18nLabel(msg`Send Email`),
  },
  draft_email: {
    label: i18nLabel(msg`Draft Email`),
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
