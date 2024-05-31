import styled from '@emotion/styled';

const StyledFieldTextAreaOverlay = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  background: ${({ theme }) => theme.background.transparent.secondary};
  backdrop-filter: ${({ theme }) => theme.blur.medium};
  align-items: center;
  display: flex;
  height: 32px;
  margin: -1px;
  width: 100%;
`;

export const FieldTextAreaOverlay = StyledFieldTextAreaOverlay;
