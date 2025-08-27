import { css } from '@emotion/react';
import { type ThemeType } from 'twenty-ui/theme';

export const FORM_FIELD_PLACEHOLDER_STYLES = (props: {
  theme: ThemeType;
}) => css`
  color: ${props.theme.font.color.light};
  font-size: ${props.theme.font.size.md};
  font-weight: ${props.theme.font.weight.medium};
`;
