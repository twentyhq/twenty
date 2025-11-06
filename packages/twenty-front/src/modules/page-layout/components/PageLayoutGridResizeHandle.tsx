import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { forwardRef } from 'react';
import {
  IconRadiusBottomLeft,
  IconRadiusBottomRight,
  IconRadiusTopLeft,
  IconRadiusTopRight,
} from 'twenty-ui/display';

type HandleAxis = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
type HorizontalHandleAxis = 'n' | 's';
type VerticalHandleAxis = 'e' | 'w';

type PageLayoutGridResizeHandleProps = {
  handleAxis?: HandleAxis;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
  onMouseUp?: React.MouseEventHandler<HTMLDivElement>;
  onTouchEnd?: React.TouchEventHandler<HTMLDivElement>;
  className?: string;
  style?: React.CSSProperties;
};

const StyledBottomRightIcon = styled(IconRadiusBottomRight)`
  color: transparent;
  cursor: nwse-resize;

  :hover {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

const StyledBottomLeftIcon = styled(IconRadiusBottomLeft)`
  color: transparent;
  cursor: nesw-resize;

  :hover {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

const StyledTopLeftIcon = styled(IconRadiusTopLeft)`
  color: transparent;
  cursor: nwse-resize;

  :hover {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

const StyledTopRightIcon = styled(IconRadiusTopRight)`
  color: transparent;
  cursor: nesw-resize;

  :hover {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

const StyledVerticalHandle = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  height: ${({ theme }) => theme.spacing(5)};
  width: ${({ theme }) => theme.icon.stroke.lg}px;
`;

const StyledHorizontalHandle = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  height: ${({ theme }) => theme.icon.stroke.lg}px;
  width: ${({ theme }) => theme.spacing(5)};
`;

const StyledHorizontalHandleWrapper = styled.div<{
  handleAxis: HorizontalHandleAxis;
}>`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: row-resize;
  transform: ${({ handleAxis }) =>
    handleAxis === 'n' ? 'translateY(-50%)' : 'translateY(50%)'};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(2)};

  :hover {
    & > div {
      background-color: ${({ theme }) => theme.font.color.tertiary};
    }
  }
`;

const StyledVerticalHandleWrapper = styled.div<{
  handleAxis: VerticalHandleAxis;
}>`
  cursor: col-resize;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  transform: ${({ handleAxis }) =>
    handleAxis === 'w' ? 'translateX(-50%)' : 'translateX(50%)'};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(2)};

  :hover {
    & > div {
      background-color: ${({ theme }) => theme.font.color.tertiary};
    }
  }
`;

const StyledResizeHandleWrapper = styled.div<{
  handleAxis?: HandleAxis;
}>`
  position: absolute;
  ${({ theme, handleAxis }) => {
    if (handleAxis === 'w') {
      return css`
        left: ${theme.spacing(2)};
        top: 50%;
        transform: translateY(-50%);
      `;
    }
    if (handleAxis === 'e') {
      return css`
        right: ${theme.spacing(2)};
        top: 50%;
        transform: translateY(-50%);
      `;
    }
    if (handleAxis === 'n') {
      return css`
        top: ${theme.spacing(2)};
        left: 50%;
        transform: translateX(-50%);
      `;
    }
    if (handleAxis === 's') {
      return css`
        bottom: ${theme.spacing(2)};
        left: 50%;
        transform: translateX(-50%);
      `;
    }
    if (handleAxis === 'se') {
      return css`
        bottom: ${theme.spacing(0.5)};
        right: ${theme.spacing(0.5)};
      `;
    }
    if (handleAxis === 'sw') {
      return css`
        bottom: ${theme.spacing(0.5)};
        left: ${theme.spacing(0.5)};
      `;
    }
    if (handleAxis === 'ne') {
      return css`
        right: ${theme.spacing(0.5)};
        top: ${theme.spacing(0.5)};
      `;
    }
    if (handleAxis === 'nw') {
      return css`
        left: ${theme.spacing(0.5)};
        top: ${theme.spacing(0.5)};
      `;
    }
  }}
`;

const isVerticalHandle = (axis?: HandleAxis): axis is VerticalHandleAxis =>
  axis === 'w' || axis === 'e';

const isHorizontalHandle = (axis?: HandleAxis): axis is HorizontalHandleAxis =>
  axis === 'n' || axis === 's';

export const PageLayoutGridResizeHandle = forwardRef<
  HTMLDivElement,
  PageLayoutGridResizeHandleProps
>(
  (
    { handleAxis, onMouseDown, onMouseUp, onTouchEnd, className, style },
    ref,
  ) => {
    const theme = useTheme();

    return (
      <StyledResizeHandleWrapper
        ref={ref}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
        className={className}
        style={style}
        handleAxis={handleAxis}
      >
        {isVerticalHandle(handleAxis) && (
          <StyledVerticalHandleWrapper handleAxis={handleAxis}>
            <StyledVerticalHandle />
          </StyledVerticalHandleWrapper>
        )}
        {isHorizontalHandle(handleAxis) && (
          <StyledHorizontalHandleWrapper handleAxis={handleAxis}>
            <StyledHorizontalHandle />
          </StyledHorizontalHandleWrapper>
        )}
        {handleAxis === 'ne' && (
          <StyledTopRightIcon
            size={theme.icon.size.lg}
            stroke={theme.icon.stroke.lg}
          />
        )}
        {handleAxis === 'nw' && (
          <StyledTopLeftIcon
            size={theme.icon.size.lg}
            stroke={theme.icon.stroke.lg}
          />
        )}
        {handleAxis === 'se' && (
          <StyledBottomRightIcon
            size={theme.icon.size.lg}
            stroke={theme.icon.stroke.lg}
          />
        )}
        {handleAxis === 'sw' && (
          <StyledBottomLeftIcon
            size={theme.icon.size.lg}
            stroke={theme.icon.stroke.lg}
          />
        )}
      </StyledResizeHandleWrapper>
    );
  },
);
