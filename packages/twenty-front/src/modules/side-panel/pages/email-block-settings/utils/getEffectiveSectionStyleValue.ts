import { type CanvasTheme, EMAIL_TYPOGRAPHY } from 'twenty-shared/utils';

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
    case 'fontSize':
      return EMAIL_TYPOGRAPHY.fontSize;
    case 'lineHeight':
      return EMAIL_TYPOGRAPHY.lineHeight;
    case 'borderColor':
      return canvasTheme?.borderColor ?? '';
    default:
      return '0px';
  }
};
