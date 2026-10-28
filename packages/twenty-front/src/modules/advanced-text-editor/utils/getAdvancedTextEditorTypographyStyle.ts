import { type AdvancedTextEditorVariant } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { type CSSProperties } from 'react';
import { EMAIL_TYPOGRAPHY } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

type AdvancedTextEditorTypography = {
  fontFamily: string;
  fontSize: string;
  accentColor: string;
  listMarkerColor: string;
  padding: string;
  lineHeight: string;
  blockSpacing: string;
  headingFontSizes: Record<1 | 2 | 3 | 4 | 5 | 6, string>;
  headingFontWeight: string;
  headingLineHeight: string;
  headingSpacingTop: string;
  headingFirstSpacingTop: string;
  headingSpacingBottom: string;
  listIndent: string;
  listItemSpacing: string;
  nestedListSpacing: string;
  quoteBorderWidth: string;
  quoteIndent: string;
  codeBlockPadding: string;
  codeBlockFontSize: string;
  dividerSpacing: string;
  taskCheckboxMargin: string;
  taskCheckboxWidth: string;
  taskCheckboxHeight: string;
  taskCheckboxVerticalAlign: string;
};

const EMAIL_SPACING = {
  padding: `${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]}`,
  lineHeight: EMAIL_TYPOGRAPHY.lineHeight,
  blockSpacing: EMAIL_TYPOGRAPHY.blockSpacing,
  headingFontSizes: {
    ...EMAIL_TYPOGRAPHY.headingFontSizes,
    4: 'calc(var(--editor-font-size) * 1.15)',
    5: 'var(--editor-font-size)',
    6: 'calc(var(--editor-font-size) * 0.9)',
  },
  headingFontWeight: EMAIL_TYPOGRAPHY.headingFontWeight,
  headingLineHeight: EMAIL_TYPOGRAPHY.headingLineHeight,
  headingSpacingTop: EMAIL_TYPOGRAPHY.headingSpacingTop,
  headingFirstSpacingTop: '0',
  headingSpacingBottom: EMAIL_TYPOGRAPHY.headingSpacingBottom,
  listIndent: EMAIL_TYPOGRAPHY.listIndent,
  listItemSpacing: EMAIL_TYPOGRAPHY.listItemSpacing,
  nestedListSpacing: '0',
  quoteBorderWidth: EMAIL_TYPOGRAPHY.quoteBorderWidth,
  quoteIndent: EMAIL_TYPOGRAPHY.quoteIndent,
  codeBlockPadding: `${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]}`,
  codeBlockFontSize: '0.9em',
  dividerSpacing: '0.5em',
  taskCheckboxMargin: '3px 3px 3px 4px',
  taskCheckboxWidth: 'auto',
  taskCheckboxHeight: 'auto',
  taskCheckboxVerticalAlign: 'baseline',
};

const NOTE_TYPOGRAPHY: AdvancedTextEditorTypography = {
  fontFamily:
    "Inter, 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Open Sans', 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: themeCssVariables.font.size.md,
  accentColor: themeCssVariables.color.blue,
  listMarkerColor: 'inherit',
  padding: '3px 0',
  lineHeight: '1.5',
  blockSpacing: '6px',
  headingFontSizes: {
    1: '3em',
    2: '2em',
    3: '1.3em',
    4: '1em',
    5: '0.9em',
    6: '0.8em',
  },
  headingFontWeight: '700',
  headingLineHeight: '1.5',
  headingSpacingTop: '21px',
  headingFirstSpacingTop: '15px',
  headingSpacingBottom: '6px',
  listIndent: '24px',
  listItemSpacing: '6px',
  nestedListSpacing: '6px',
  quoteBorderWidth: '2px',
  quoteIndent: '1em',
  codeBlockPadding: '24px',
  codeBlockFontSize: '1em',
  dividerSpacing: '12.5px',
  taskCheckboxMargin: '0 0 0 4px',
  taskCheckboxWidth: '12px',
  taskCheckboxHeight: '24px',
  taskCheckboxVerticalAlign: 'top',
};

const VARIANT_TYPOGRAPHY: Record<
  AdvancedTextEditorVariant,
  AdvancedTextEditorTypography
> = {
  app: {
    fontFamily: themeCssVariables.font.family,
    fontSize: themeCssVariables.font.size.md,
    accentColor: themeCssVariables.color.blue,
    listMarkerColor: 'inherit',
    ...EMAIL_SPACING,
  },
  email: {
    fontFamily: EMAIL_TYPOGRAPHY.fontFamily,
    fontSize: EMAIL_TYPOGRAPHY.fontSize,
    accentColor: EMAIL_TYPOGRAPHY.accentColor,
    listMarkerColor: EMAIL_TYPOGRAPHY.accentColor,
    ...EMAIL_SPACING,
  },
  note: NOTE_TYPOGRAPHY,
  widget: {
    ...NOTE_TYPOGRAPHY,
    lineHeight: '1.4',
    headingLineHeight: '1.4',
  },
};

export const getAdvancedTextEditorTypographyStyle = (
  variant: AdvancedTextEditorVariant,
) => {
  const typography = VARIANT_TYPOGRAPHY[variant];

  return {
    '--editor-font-family': typography.fontFamily,
    '--editor-font-size': typography.fontSize,
    '--editor-accent-color': typography.accentColor,
    '--editor-list-marker-color': typography.listMarkerColor,
    '--editor-padding': typography.padding,
    '--editor-line-height': typography.lineHeight,
    '--editor-block-spacing': typography.blockSpacing,
    '--editor-heading-1-font-size': typography.headingFontSizes[1],
    '--editor-heading-2-font-size': typography.headingFontSizes[2],
    '--editor-heading-3-font-size': typography.headingFontSizes[3],
    '--editor-heading-4-font-size': typography.headingFontSizes[4],
    '--editor-heading-5-font-size': typography.headingFontSizes[5],
    '--editor-heading-6-font-size': typography.headingFontSizes[6],
    '--editor-heading-font-weight': typography.headingFontWeight,
    '--editor-heading-line-height': typography.headingLineHeight,
    '--editor-heading-spacing-top': typography.headingSpacingTop,
    '--editor-heading-first-spacing-top': typography.headingFirstSpacingTop,
    '--editor-heading-spacing-bottom': typography.headingSpacingBottom,
    '--editor-list-indent': typography.listIndent,
    '--editor-list-item-spacing': typography.listItemSpacing,
    '--editor-nested-list-spacing': typography.nestedListSpacing,
    '--editor-quote-border-width': typography.quoteBorderWidth,
    '--editor-quote-indent': typography.quoteIndent,
    '--editor-code-block-padding': typography.codeBlockPadding,
    '--editor-code-block-font-size': typography.codeBlockFontSize,
    '--editor-divider-spacing': typography.dividerSpacing,
    '--editor-task-checkbox-margin': typography.taskCheckboxMargin,
    '--editor-task-checkbox-width': typography.taskCheckboxWidth,
    '--editor-task-checkbox-height': typography.taskCheckboxHeight,
    '--editor-task-checkbox-vertical-align':
      typography.taskCheckboxVerticalAlign,
  } as CSSProperties;
};
