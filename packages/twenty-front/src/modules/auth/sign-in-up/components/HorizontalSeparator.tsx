import { JSX } from 'react';
import styled from '@emotion/styled';

type HorizontalSeparatorProps = {
  visible?: boolean;
};
const StyledSeparator = styled.div<HorizontalSeparatorProps>`
  background-color: ${({ theme }) => theme.border.color.medium};
  height: ${({ visible }) => (visible ? '1px' : 0)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(3)};
  width: 100%;
`;

export const HorizontalSeparator = ({
  visible = true,
}: HorizontalSeparatorProps): JSX.Element => (
  <StyledSeparator visible={visible} />
);
