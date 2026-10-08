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
    case 'fontSize':
      return '14px';
    case 'lineHeight':
      return '1.5';
    case 'borderColor':
      return canvasTheme?.borderColor ?? '';
    default:
      return '0px';
  }
};
