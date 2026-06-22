import { msg } from '@lingui/core/macro';

import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

export type ActionToolLabels = {
  label: string;
  inProgressLabel?: string;
  completedLabel?: string;
};

export const ACTION_TOOL_LABELS: Record<string, ActionToolLabels> = {
  http_request: {
    label: i18nLabel(msg`HTTP Request`),
  },
  send_email: {
    label: i18nLabel(msg`Send Email`),
    inProgressLabel: i18nLabel(msg`Sending email`),
    completedLabel: i18nLabel(msg`Sent email`),
  },
  draft_email: {
    label: i18nLabel(msg`Draft Email`),
    inProgressLabel: i18nLabel(msg`Drafting email`),
    completedLabel: i18nLabel(msg`Drafted email`),
  },
  search_help_center: {
    label: i18nLabel(msg`Search Help Center`),
    inProgressLabel: i18nLabel(msg`Searching the help center`),
    completedLabel: i18nLabel(msg`Searched the help center`),
  },
  code_interpreter: {
    label: i18nLabel(msg`Code Interpreter`),
  },
  navigate_app: {
    label: i18nLabel(msg`Navigate App`),
    inProgressLabel: i18nLabel(msg`Navigating in the app`),
    completedLabel: i18nLabel(msg`Navigated in the app`),
  },
};
