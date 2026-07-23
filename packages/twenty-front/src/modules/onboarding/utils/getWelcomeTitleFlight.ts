import { type WelcomeTitleFlight } from '@/onboarding/types/WelcomeTitleFlight';

type GetWelcomeTitleFlightArgs = {
  sourceRect: DOMRect;
  sourcePaddingLeftInPx: number;
  sourceFontSizeInPx: number;
  targetRect: DOMRect;
  targetFontSizeInPx: number;
};

export const getWelcomeTitleFlight = ({
  sourceRect,
  sourcePaddingLeftInPx,
  sourceFontSizeInPx,
  targetRect,
  targetFontSizeInPx,
}: GetWelcomeTitleFlightArgs): WelcomeTitleFlight => {
  const sourceTextLeft = sourceRect.left + sourcePaddingLeftInPx;
  const sourceCenterY = sourceRect.top + sourceRect.height / 2;
  const targetCenterY = targetRect.top + targetRect.height / 2;

  return {
    translateXInPx: targetRect.left - sourceTextLeft,
    translateYInPx: targetCenterY - sourceCenterY,
    scale: sourceFontSizeInPx > 0 ? targetFontSizeInPx / sourceFontSizeInPx : 1,
    transformOriginXInPx: sourcePaddingLeftInPx,
  };
};
