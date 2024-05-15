import styled from '@emotion/styled';

const StyledFieldTextAreaOverlay = styled.div`
  align-items: center;
  backdrop-filter: blur(8px);
  background: ${({ theme }) => theme.background.transparent.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  height: 32px;
  margin: -1px;
  width: 100%;
`;

export const FieldTextAreaOverlay = StyledFieldTextAreaOverlay;
