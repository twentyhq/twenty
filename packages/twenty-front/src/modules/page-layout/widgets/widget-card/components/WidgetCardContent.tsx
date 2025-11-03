import { type PageLayoutTabLayoutMode } from '@/page-layout/types/PageLayoutTabLayoutMode';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { type PageLayoutType } from '~/generated/graphql';

export type WidgetCardContentProps = {
  children?: ReactNode;
  pageLayoutType: PageLayoutType;
  layoutMode: PageLayoutTabLayoutMode;
  className?: string;
};

const StyledWidgetCardContent = styled.div<WidgetCardContentProps>`
  align-items: center;
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  box-sizing: border-box;
  padding: ${({ theme }) => theme.spacing(2)};

  ${({ theme, pageLayoutType, layoutMode }) => {
    if (layoutMode === 'canvas') {
      return css`
        padding: 0;
      `;
    }

    switch (pageLayoutType) {
      case 'RECORD_PAGE':
        return css`
          border: 1px solid ${theme.border.color.medium};
          border-radius: ${theme.border.radius.md};
        `;

      default:
        return '';
    }
  }}
`;

export { StyledWidgetCardContent as WidgetCardContent };
