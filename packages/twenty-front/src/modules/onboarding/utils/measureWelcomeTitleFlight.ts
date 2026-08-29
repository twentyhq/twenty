import { isDefined } from 'twenty-shared/utils';

import { WELCOME_TITLE_HANDOFF_TARGET_ELEMENT_ID } from '@/onboarding/constants/WelcomeTitleHandoffTargetElementId';
import { WELCOME_TITLE_SOURCE_ELEMENT_ID } from '@/onboarding/constants/WelcomeTitleSourceElementId';
import { type WelcomeTitleFlight } from '@/onboarding/types/WelcomeTitleFlight';
import { getWelcomeTitleFlight } from '@/onboarding/utils/getWelcomeTitleFlight';

const isElementLaidOutAndVisible = (
  rect: DOMRect,
  style: CSSStyleDeclaration,
) => rect.width > 0 && rect.height > 0 && style.visibility === 'visible';

export const measureWelcomeTitleFlight = (): WelcomeTitleFlight | null => {
  const sourceElement = document.getElementById(
    WELCOME_TITLE_SOURCE_ELEMENT_ID,
  );
  const targetElement = document.getElementById(
    WELCOME_TITLE_HANDOFF_TARGET_ELEMENT_ID,
  );

  if (!isDefined(sourceElement) || !isDefined(targetElement)) {
    return null;
  }

  const sourceStyle = window.getComputedStyle(sourceElement);
  const targetStyle = window.getComputedStyle(targetElement);
  const sourceRect = sourceElement.getBoundingClientRect();
  const targetRect = targetElement.getBoundingClientRect();

  if (
    !isElementLaidOutAndVisible(sourceRect, sourceStyle) ||
    !isElementLaidOutAndVisible(targetRect, targetStyle)
  ) {
    return null;
  }

  return getWelcomeTitleFlight({
    sourceRect,
    sourcePaddingLeftInPx: parseFloat(sourceStyle.paddingLeft),
    sourceFontSizeInPx: parseFloat(sourceStyle.fontSize),
    targetRect,
    targetFontSizeInPx: parseFloat(targetStyle.fontSize),
  });
};
