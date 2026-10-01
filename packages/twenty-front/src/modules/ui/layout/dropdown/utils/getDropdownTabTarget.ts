import { tabbable } from 'tabbable';
import { isDefined } from 'twenty-shared/utils';

const EXCLUDED_TAB_TARGET_SELECTOR =
  '[data-base-ui-focus-guard], [data-floating-ui-focus-guard], [aria-hidden="true"]';

export const getDropdownTabTarget = ({
  trigger,
  popup,
  isBackward,
}: {
  trigger: HTMLElement;
  popup: HTMLElement;
  isBackward: boolean;
}) => {
  const tabTargets = tabbable(trigger.ownerDocument.body).filter((element) => {
    const isExcludedTarget =
      popup.contains(element) ||
      isDefined(element.closest(EXCLUDED_TAB_TARGET_SELECTOR));

    return !isExcludedTarget;
  });
  const triggerIndex = tabTargets.indexOf(trigger);

  if (triggerIndex < 0) {
    return trigger;
  }

  return tabTargets[triggerIndex + (isBackward ? -1 : 1)] ?? trigger;
};
