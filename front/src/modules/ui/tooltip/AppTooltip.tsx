import { Tooltip } from 'react-tooltip';
import styled from '@emotion/styled';

export enum TooltipPosition {
  Top = 'top',
  Left = 'left',
  Right = 'right',
  Bottom = 'bottom',
}

export const AppTooltip = styled(Tooltip)`
  background-color: ${({ theme }) => theme.background.primary};
  box-shadow: ${({ theme }) => theme.boxShadow.light};

  color: ${({ theme }) => theme.font.color.primary};

  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  max-width: 40%;

  padding: ${({ theme }) => theme.spacing(2)};
  word-break: break-word;

  z-index: ${({ theme }) => theme.lastLayerZIndex};
`;
