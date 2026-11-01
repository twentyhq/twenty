import { EMAIL_TYPOGRAPHY } from 'twenty-shared/utils';

export type EmailNodeRenderContext = {
  isFirstChild: boolean;
  isLastChild: boolean;
};

export const blockSpacing = (
  { isLastChild }: EmailNodeRenderContext,
  spacing: string = EMAIL_TYPOGRAPHY.blockSpacing,
) => ({
  marginTop: '0',
  marginBottom: isLastChild ? '0' : spacing,
});
