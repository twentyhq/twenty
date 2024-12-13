import styled from '@emotion/styled';

// eslint-disable-next-line @nx/workspace-styled-components-prefixed-with-styled
export const OverlayContainer = styled.div`
  align-items: center;
  display: flex;

  min-height: 32px;
  backdrop-filter: ${({ theme }) => theme.blur.medium};
  width: fit-content;
  min-width: 150px;

  border-radius: ${({ theme }) => theme.border.radius.md};

  background: ${({ theme }) => theme.background.transparent.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};

  overflow: hidden;

  z-index: 30;
`;