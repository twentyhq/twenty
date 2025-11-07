import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { forwardRef } from 'react';
import {
  IconRadiusBottomLeft,
  IconRadiusBottomRight,
  IconRadiusTopLeft,
  IconRadiusTopRight,
} from 'twenty-ui/display';

type WidgetHandleAxis = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
type WidgetHorizontalHandleAxis = 'n' | 's';
type WidgetVerticalHandleAxis = 'e' | 'w';

type PageLayoutGridResizeHandleProps = {
  handleAxis?: WidgetHandleAxis;
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
  widgetHandleAxis: WidgetHorizontalHandleAxis;
}>`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: row-resize;
  transform: ${({ widgetHandleAxis }) =>
    widgetHandleAxis === 'n' ? 'translateY(-50%)' : 'translateY(50%)'};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(2)};

  :hover {
    & > div {
      background-color: ${({ theme }) => theme.font.color.tertiary};
    }
  }
`;

const StyledVerticalHandleWrapper = styled.div<{
  widgetHandleAxis: WidgetVerticalHandleAxis;
}>`
  cursor: col-resize;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  transform: ${({ widgetHandleAxis }) =>
    widgetHandleAxis === 'w' ? 'translateX(-50%)' : 'translateX(50%)'};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(2)};

  :hover {
    & > div {
      background-color: ${({ theme }) => theme.font.color.tertiary};
    }
  }
`;

const StyledResizeHandleWrapper = styled.div<{
  widgetHandleAxis?: WidgetHandleAxis;
}>`
  position: absolute;
  ${({ theme, widgetHandleAxis }) => {
    if (widgetHandleAxis === 'w') {
      return css`
        left: ${theme.spacing(2)};
        top: 50%;
        transform: translateY(-50%);
      `;
    }
    if (widgetHandleAxis === 'e') {
      return css`
        right: ${theme.spacing(2)};
        top: 50%;
        transform: translateY(-50%);
      `;
    }
    if (widgetHandleAxis === 'n') {
      return css`
        top: ${theme.spacing(2)};
        left: 50%;
        transform: translateX(-50%);
      `;
    }
    if (widgetHandleAxis === 's') {
      return css`
        bottom: ${theme.spacing(2)};
        left: 50%;
        transform: translateX(-50%);
      `;
    }
    if (widgetHandleAxis === 'se') {
      return css`
        bottom: ${theme.spacing(0.5)};
        right: ${theme.spacing(0.5)};
      `;
    }
    if (widgetHandleAxis === 'sw') {
      return css`
        bottom: ${theme.spacing(0.5)};
        left: ${theme.spacing(0.5)};
      `;
    }
    if (widgetHandleAxis === 'ne') {
      return css`
        right: ${theme.spacing(0.5)};
        top: ${theme.spacing(0.5)};
      `;
    }
    if (widgetHandleAxis === 'nw') {
      return css`
        left: ${theme.spacing(0.5)};
        top: ${theme.spacing(0.5)};
      `;
    }
  }}
`;

const isVerticalHandle = (
  widgetHandleAxis?: WidgetHandleAxis,
): widgetHandleAxis is WidgetVerticalHandleAxis =>
  widgetHandleAxis === 'w' || widgetHandleAxis === 'e';

const isHorizontalHandle = (
  widgetHandleAxis?: WidgetHandleAxis,
): widgetHandleAxis is WidgetHorizontalHandleAxis =>
  widgetHandleAxis === 'n' || widgetHandleAxis === 's';

export const PageLayoutGridResizeHandle = forwardRef<
  HTMLDivElement,
  PageLayoutGridResizeHandleProps
>(
  (
    {
      handleAxis: widgetHandleAxis,
      onMouseDown,
      onMouseUp,
      onTouchEnd,
      className,
      style,
    },
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
        widgetHandleAxis={widgetHandleAxis}
      >
        {isVerticalHandle(widgetHandleAxis) && (
          <StyledVerticalHandleWrapper widgetHandleAxis={widgetHandleAxis}>
            <StyledVerticalHandle />
          </StyledVerticalHandleWrapper>
        )}
        {isHorizontalHandle(widgetHandleAxis) && (
          <StyledHorizontalHandleWrapper widgetHandleAxis={widgetHandleAxis}>
            <StyledHorizontalHandle />
          </StyledHorizontalHandleWrapper>
        )}
        {widgetHandleAxis === 'ne' && (
          <StyledTopRightIcon
            size={theme.icon.size.lg}
            stroke={theme.icon.stroke.lg}
          />
        )}
        {widgetHandleAxis === 'nw' && (
          <StyledTopLeftIcon
            size={theme.icon.size.lg}
            stroke={theme.icon.stroke.lg}
          />
        )}
        {widgetHandleAxis === 'se' && (
          <StyledBottomRightIcon
            size={theme.icon.size.lg}
            stroke={theme.icon.stroke.lg}
          />
        )}
        {widgetHandleAxis === 'sw' && (
          <StyledBottomLeftIcon
            size={theme.icon.size.lg}
            stroke={theme.icon.stroke.lg}
          />
        )}
      </StyledResizeHandleWrapper>
    );
  },
);
