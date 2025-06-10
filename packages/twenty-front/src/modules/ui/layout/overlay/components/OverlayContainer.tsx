import styled from '@emotion/styled';

// eslint-disable-next-line @nx/workspace-styled-components-prefixed-with-styled
export const OverlayContainer = styled.div<{
  borderRadius?: 'sm' | 'md';
  hasDangerBorder?: boolean;
}>`
  align-items: center;
  display: flex;

  backdrop-filter: ${({ theme }) => theme.blur.medium};

  border-radius: ${({ theme, borderRadius }) =>
    theme.border.radius[borderRadius ?? 'md']};

  background: ${({ theme }) => theme.background.transparent.primary};
  border: 1px solid
    ${({ theme, hasDangerBorder }) =>
      theme.border.color[hasDangerBorder ? 'danger' : 'medium']};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};

  overflow: hidden;

  z-index: 30;
`;
