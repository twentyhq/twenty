import { type CanvasTheme } from 'twenty-shared/utils';

export const getEffectiveSectionStyleValue = (
  property: string,
  canvasTheme: CanvasTheme | null,
): string => {
  switch (property) {
    case 'color':
      return canvasTheme?.textColor ?? '';
    case 'textAlign':
      return canvasTheme?.textAlign ?? 'left';
    case 'backgroundColor':
      return canvasTheme?.bodyBackground ?? '';
    // react-email's Text writes 14px, and our paragraph renderer writes 1.5.
    case 'fontSize':
      return '14px';
    case 'lineHeight':
      return '1.5';
    case 'borderColor':
      return canvasTheme?.borderColor ?? '';
    default:
      // Box longhands (padding, margin, radius), widths and spacing all
      // render as zero until overridden.
      return '0px';
  }
};
