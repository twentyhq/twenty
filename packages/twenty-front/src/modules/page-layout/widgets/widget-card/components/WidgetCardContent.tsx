import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { type WidgetCardVariant } from '~/modules/page-layout/widgets/types/WidgetCardVariant';

const StyledWidgetCardContent = styled.div<{ variant: WidgetCardVariant }>`
  align-items: center;
  display: flex;
  height: 100%;
  flex: 1;
  overflow: hidden;
  justify-content: center;
  box-sizing: border-box;

  ${({ theme, variant }) => {
    if (variant === 'dashboard') {
      return css`
        padding: ${theme.spacing(2)};
      `;
    }

    if (variant === 'record-page') {
      return css`
        border: 1px solid ${theme.border.color.medium};
        border-radius: ${theme.border.radius.md};
        padding: ${theme.spacing(2)};
      `;
    }
  }}
`;

export { StyledWidgetCardContent as WidgetCardContent };
