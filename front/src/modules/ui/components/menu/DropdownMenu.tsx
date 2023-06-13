import styled from '@emotion/styled';

export const DropdownMenu = styled.div`
  align-items: center;
  backdrop-filter: blur(20px);

  background: ${(props) => props.theme.secondaryBackgroundTransparent};
  border: 1px solid ${(props) => props.theme.lightBorder};
  border-radius: calc(${(props) => props.theme.borderRadius} * 2);

  box-shadow: ${(props) => props.theme.modalBoxShadow};

  display: flex;

  flex-direction: column;

  height: fit-content;

  width: 200px;
`;
