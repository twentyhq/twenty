import { PlacesType, PositionStrategy, Tooltip } from 'react-tooltip';
import styled from '@emotion/styled';

import { rgba } from '../theme/constants/colors';

export enum TooltipPosition {
  Top = 'top',
  Left = 'left',
  Right = 'right',
  Bottom = 'bottom',
}

const StyledAppTooltip = styled(Tooltip)`
  backdrop-filter: ${({ theme }) => theme.blur.strong};
  background-color: ${({ theme }) => rgba(theme.color.gray80, 0.8)};
  border-radius: ${({ theme }) => theme.border.radius.sm};

  box-shadow: ${({ theme }) => theme.boxShadow.light};
  color: ${({ theme }) => theme.grayScale.gray0};

  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};

  max-width: 40%;
  overflow: visible;

  padding: ${({ theme }) => theme.spacing(2)};

  word-break: break-word;

  z-index: ${({ theme }) => theme.lastLayerZIndex};
`;

export type AppTooltipProps = {
  className?: string;
  anchorSelect?: string;
  content?: string;
  delayHide?: number;
  offset?: number;
  noArrow?: boolean;
  isOpen?: boolean;
  place?: PlacesType;
  positionStrategy?: PositionStrategy;
};

export const AppTooltip = ({
  anchorSelect,
  className,
  content,
  delayHide,
  isOpen,
  noArrow,
  offset,
  place,
  positionStrategy,
}: AppTooltipProps) => (
  <StyledAppTooltip
    {...{
      anchorSelect,
      className,
      content,
      delayHide,
      isOpen,
      noArrow,
      offset,
      place,
      positionStrategy,
    }}
  />
);
