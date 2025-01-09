import styled from '@emotion/styled';

// eslint-disable-next-line @nx/workspace-styled-components-prefixed-with-styled
export const OverlayContainer = styled.div<{
  borderRadius?: 'sm' | 'md';
}>`
  align-items: center;
  display: flex;

  backdrop-filter: ${({ theme }) => theme.blur.medium};
  width: fit-content;

  border-radius: ${({ theme, borderRadius }) =>
    theme.border.radius[borderRadius ?? 'md']};

  background: ${({ theme }) => theme.background.transparent.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};

  overflow: hidden;

  z-index: 30;
`;
