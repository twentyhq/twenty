import styled from '@emotion/styled';
import { EllipsisDisplay } from './EllipsisDisplay';

type NumberDisplayProps = {
  value: string | number | null | undefined;
  decimals?: number;
};

const StyledEllipsisDisplay = styled(EllipsisDisplay)`
  align-items: center;
  display: flex;
  height: 20px;
`;

export const NumberDisplay = ({ value }: NumberDisplayProps) => (
  <StyledEllipsisDisplay>{value}</StyledEllipsisDisplay>
);
