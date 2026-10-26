import { type AdvancedTextEditorVariant } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { type CSSProperties } from 'react';
import { EMAIL_TYPOGRAPHY } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const VARIANT_TYPOGRAPHY: Record<
  AdvancedTextEditorVariant,
  {
    fontFamily: string;
    fontSize: string;
    accentColor: string;
    listMarkerColor: string;
  }
> = {
  app: {
    fontFamily: themeCssVariables.font.family,
    fontSize: themeCssVariables.font.size.md,
    accentColor: themeCssVariables.color.blue,
    listMarkerColor: 'inherit',
  },
  email: {
    fontFamily: EMAIL_TYPOGRAPHY.fontFamily,
    fontSize: EMAIL_TYPOGRAPHY.fontSize,
    accentColor: EMAIL_TYPOGRAPHY.accentColor,
    listMarkerColor: EMAIL_TYPOGRAPHY.accentColor,
  },
};

export const getAdvancedTextEditorTypographyStyle = (
  variant: AdvancedTextEditorVariant,
) => {
  const { fontFamily, fontSize, accentColor, listMarkerColor } =
    VARIANT_TYPOGRAPHY[variant];

  return {
    '--editor-font-family': fontFamily,
    '--editor-font-size': fontSize,
    '--editor-accent-color': accentColor,
    '--editor-list-marker-color': listMarkerColor,
    '--editor-line-height': EMAIL_TYPOGRAPHY.lineHeight,
    '--editor-block-spacing': EMAIL_TYPOGRAPHY.blockSpacing,
    '--editor-heading-1-font-size': EMAIL_TYPOGRAPHY.headingFontSizes[1],
    '--editor-heading-2-font-size': EMAIL_TYPOGRAPHY.headingFontSizes[2],
    '--editor-heading-3-font-size': EMAIL_TYPOGRAPHY.headingFontSizes[3],
    '--editor-heading-font-weight': EMAIL_TYPOGRAPHY.headingFontWeight,
    '--editor-heading-line-height': EMAIL_TYPOGRAPHY.headingLineHeight,
    '--editor-heading-spacing-top': EMAIL_TYPOGRAPHY.headingSpacingTop,
    '--editor-heading-spacing-bottom': EMAIL_TYPOGRAPHY.headingSpacingBottom,
    '--editor-list-indent': EMAIL_TYPOGRAPHY.listIndent,
    '--editor-list-item-spacing': EMAIL_TYPOGRAPHY.listItemSpacing,
    '--editor-quote-border-width': EMAIL_TYPOGRAPHY.quoteBorderWidth,
    '--editor-quote-indent': EMAIL_TYPOGRAPHY.quoteIndent,
  } as CSSProperties;
};
