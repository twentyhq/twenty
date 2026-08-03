import { type CanvasTheme } from 'twenty-shared/utils';

// What a section property actually renders as when it carries no override of
// its own, so the panel shows real values like the body panel does rather
// than a row of grey placeholders. Properties that inherit resolve to the
// body theme; the rest resolve to what the renderer emits by default.
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
