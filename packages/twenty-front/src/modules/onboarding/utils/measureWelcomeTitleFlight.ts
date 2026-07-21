import { isDefined } from 'twenty-shared/utils';

import { WELCOME_TITLE_HANDOFF_TARGET_ELEMENT_ID } from '@/onboarding/constants/WelcomeTitleHandoffTargetElementId';
import { type WelcomeTitleFlight } from '@/onboarding/types/WelcomeTitleFlight';
import { getWelcomeTitleFlight } from '@/onboarding/utils/getWelcomeTitleFlight';

const isElementLaidOutAndVisible = (
  rect: DOMRect,
  style: CSSStyleDeclaration,
) => rect.width > 0 && rect.height > 0 && style.visibility === 'visible';

export const measureWelcomeTitleFlight = (
  sourceElement: HTMLElement | null,
): WelcomeTitleFlight | null => {
  const targetElement = document.getElementById(
    WELCOME_TITLE_HANDOFF_TARGET_ELEMENT_ID,
  );

  if (!isDefined(sourceElement) || !isDefined(targetElement)) {
    return null;
  }

  const sourceStyle = window.getComputedStyle(sourceElement);
  const targetStyle = window.getComputedStyle(targetElement);
  const targetRect = targetElement.getBoundingClientRect();

  if (!isElementLaidOutAndVisible(targetRect, targetStyle)) {
    return null;
  }

  return getWelcomeTitleFlight({
    sourceRect: sourceElement.getBoundingClientRect(),
    sourcePaddingLeftInPx: parseFloat(sourceStyle.paddingLeft),
    sourceFontSizeInPx: parseFloat(sourceStyle.fontSize),
    targetRect,
    targetFontSizeInPx: parseFloat(targetStyle.fontSize),
  });
};
