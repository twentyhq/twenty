import { type AdvancedTextEditorVariant } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { type CSSProperties } from 'react';
import { EMAIL_TYPOGRAPHY } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

type AdvancedTextEditorSpacing = {
  padding: string;
  lineHeight: string;
  blockSpacing: string;
  headingLineHeight: string;
  headingSpacingTop: string;
  headingFirstSpacingTop: string;
  headingSpacingBottom: string;
  listIndent: string;
  listItemSpacing: string;
  nestedListSpacing: string;
  quoteIndent: string;
  codeBlockPadding: string;
  dividerSpacing: string;
  taskCheckboxMargin: string;
  taskCheckboxWidth: string;
  taskCheckboxHeight: string;
  taskCheckboxVerticalAlign: string;
  tableWrapperPadding: string;
  tableCellPadding: string;
  toggleRowHeight: string;
};

const DEFAULT_SPACING: AdvancedTextEditorSpacing = {
  padding: `${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]}`,
  lineHeight: EMAIL_TYPOGRAPHY.lineHeight,
  blockSpacing: EMAIL_TYPOGRAPHY.blockSpacing,
  headingLineHeight: EMAIL_TYPOGRAPHY.headingLineHeight,
  headingSpacingTop: EMAIL_TYPOGRAPHY.headingSpacingTop,
  headingFirstSpacingTop: '0',
  headingSpacingBottom: EMAIL_TYPOGRAPHY.headingSpacingBottom,
  listIndent: EMAIL_TYPOGRAPHY.listIndent,
  listItemSpacing: EMAIL_TYPOGRAPHY.listItemSpacing,
  nestedListSpacing: '0',
  quoteIndent: EMAIL_TYPOGRAPHY.quoteIndent,
  codeBlockPadding: `${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]}`,
  dividerSpacing: '0.5em',
  taskCheckboxMargin: '3px 3px 3px 4px',
  taskCheckboxWidth: 'auto',
  taskCheckboxHeight: 'auto',
  taskCheckboxVerticalAlign: 'baseline',
  tableWrapperPadding: `0 ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[4]} 0`,
  tableCellPadding: `${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]}`,
  toggleRowHeight: '0px',
};

const NOTE_SPACING: AdvancedTextEditorSpacing = {
  padding: '3px 0',
  lineHeight: '1.5',
  blockSpacing: '6px',
  headingLineHeight: '1.5',
  headingSpacingTop: '21px',
  headingFirstSpacingTop: '15px',
  headingSpacingBottom: '6px',
  listIndent: '24px',
  listItemSpacing: '6px',
  nestedListSpacing: '6px',
  quoteIndent: '1em',
  codeBlockPadding: '24px',
  dividerSpacing: '12.5px',
  taskCheckboxMargin: `0 0 0 ${themeCssVariables.spacing[1]}`,
  taskCheckboxWidth: '12px',
  taskCheckboxHeight: '24px',
  taskCheckboxVerticalAlign: 'top',
  tableWrapperPadding: '9px 22px 22px 9px',
  tableCellPadding: '5px 10px',
  toggleRowHeight: '24px',
};

const VARIANT_SPACING: Record<
  AdvancedTextEditorVariant,
  AdvancedTextEditorSpacing
> = {
  app: DEFAULT_SPACING,
  email: DEFAULT_SPACING,
  note: NOTE_SPACING,
  widget: { ...NOTE_SPACING, lineHeight: '1.4', headingLineHeight: '1.4' },
};

const APP_TYPOGRAPHY = {
  fontFamily: themeCssVariables.font.family,
  fontSize: themeCssVariables.font.size.md,
  accentColor: themeCssVariables.color.blue,
  listMarkerColor: 'inherit',
};

const VARIANT_TYPOGRAPHY: Record<
  AdvancedTextEditorVariant,
  typeof APP_TYPOGRAPHY
> = {
  app: APP_TYPOGRAPHY,
  email: {
    fontFamily: EMAIL_TYPOGRAPHY.fontFamily,
    fontSize: EMAIL_TYPOGRAPHY.fontSize,
    accentColor: EMAIL_TYPOGRAPHY.accentColor,
    listMarkerColor: EMAIL_TYPOGRAPHY.accentColor,
  },
  note: APP_TYPOGRAPHY,
  widget: APP_TYPOGRAPHY,
};

export const getAdvancedTextEditorTypographyStyle = (
  variant: AdvancedTextEditorVariant,
) => {
  const { fontFamily, fontSize, accentColor, listMarkerColor } =
    VARIANT_TYPOGRAPHY[variant];
  const spacing = VARIANT_SPACING[variant];

  return {
    '--editor-font-family': fontFamily,
    '--editor-font-size': fontSize,
    '--editor-accent-color': accentColor,
    '--editor-list-marker-color': listMarkerColor,
    '--editor-padding': spacing.padding,
    '--editor-line-height': spacing.lineHeight,
    '--editor-block-spacing': spacing.blockSpacing,
    '--editor-heading-1-font-size': EMAIL_TYPOGRAPHY.headingFontSizes[1],
    '--editor-heading-2-font-size': EMAIL_TYPOGRAPHY.headingFontSizes[2],
    '--editor-heading-3-font-size': EMAIL_TYPOGRAPHY.headingFontSizes[3],
    '--editor-heading-font-weight': EMAIL_TYPOGRAPHY.headingFontWeight,
    '--editor-heading-line-height': spacing.headingLineHeight,
    '--editor-heading-spacing-top': spacing.headingSpacingTop,
    '--editor-heading-first-spacing-top': spacing.headingFirstSpacingTop,
    '--editor-heading-spacing-bottom': spacing.headingSpacingBottom,
    '--editor-list-indent': spacing.listIndent,
    '--editor-list-item-spacing': spacing.listItemSpacing,
    '--editor-nested-list-spacing': spacing.nestedListSpacing,
    '--editor-quote-border-width': EMAIL_TYPOGRAPHY.quoteBorderWidth,
    '--editor-quote-indent': spacing.quoteIndent,
    '--editor-code-block-padding': spacing.codeBlockPadding,
    '--editor-divider-spacing': spacing.dividerSpacing,
    '--editor-task-checkbox-margin': spacing.taskCheckboxMargin,
    '--editor-task-checkbox-width': spacing.taskCheckboxWidth,
    '--editor-task-checkbox-height': spacing.taskCheckboxHeight,
    '--editor-task-checkbox-vertical-align': spacing.taskCheckboxVerticalAlign,
    '--editor-table-wrapper-padding': spacing.tableWrapperPadding,
    '--editor-table-cell-padding': spacing.tableCellPadding,
    '--editor-toggle-row-height': spacing.toggleRowHeight,
  } as CSSProperties;
};
