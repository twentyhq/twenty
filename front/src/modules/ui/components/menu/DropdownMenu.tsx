import styled from '@emotion/styled';

import { textInputStyle } from '@/ui/layout/styles/themes';

export const DropdownMenu = styled.div`
  width: 200px;

  display: flex;
  align-items: center;

  background: ${(props) => props.theme.secondaryBackgroundTransparent};

  border: 1px solid ${(props) => props.theme.lightBorder};

  border-radius: calc(${(props) => props.theme.borderRadius} * 2);

  box-shadow: 0px 3px 12px rgba(0, 0, 0, 0.09);

  backdrop-filter: blur(20px);
`;
