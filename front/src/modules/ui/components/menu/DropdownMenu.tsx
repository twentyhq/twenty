import styled from '@emotion/styled';

export const DropdownMenu = styled.div`
  width: 200px;
  height: fit-content;

  display: flex;
  flex-direction: column;
  align-items: center;

  background: ${(props) => props.theme.secondaryBackgroundTransparent};

  border: 1px solid ${(props) => props.theme.lightBorder};

  border-radius: calc(${(props) => props.theme.borderRadius} * 2);

  box-shadow: ${(props) => props.theme.modalBoxShadow};

  backdrop-filter: blur(20px);
`;
