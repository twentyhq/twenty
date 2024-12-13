import styled from '@emotion/styled';

const StyledFieldTextAreaOverlay = styled.div`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  margin: -1px;
  max-height: 420px;
  position: absolute;
  top: 0;
  width: 100%;
`;

export const FieldTextAreaOverlay = StyledFieldTextAreaOverlay;
