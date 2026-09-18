import { isDefined } from 'twenty-shared/utils';

import { DIALOG_CLICK_OUTSIDE_ID } from '@/ui/feedback/dialog-manager/constants/DialogClickOutsideId';
import { DIALOG_CLICK_OUTSIDE_LISTENER_EXCLUDED_ID } from '@/ui/layout/dialog/constants/DialogClickOutsideListenerExcludedClassName';

const EXCLUDED_OVERLAY_SELECTOR = [
  `[data-click-outside-id="${DIALOG_CLICK_OUTSIDE_LISTENER_EXCLUDED_ID}"]`,
  `[data-click-outside-id="${DIALOG_CLICK_OUTSIDE_ID}"]`,
  '[data-globally-prevent-click-outside="true"]',
].join(',');

export const isDialogDismissalExcluded = (target: EventTarget | null) =>
  target instanceof Element &&
  isDefined(target.closest(EXCLUDED_OVERLAY_SELECTOR));
