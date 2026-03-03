import { styled } from '@linaria/react';
import { forwardRef, useContext } from 'react';
import {
  IconRadiusBottomLeft,
  IconRadiusBottomRight,
  IconRadiusTopLeft,
  IconRadiusTopRight,
} from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { css } from '@linaria/core';
import { ThemeContext } from 'twenty-ui/theme';

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

const StyledCornerIconWrapper = styled.div<{
  cursor: 'nwse-resize' | 'nesw-resize';
  position: 'ne' | 'nw' | 'se' | 'sw';
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${({ cursor }) => cursor};
  width: ${themeCssVariables.spacing[4]};
  height: ${themeCssVariables.spacing[4]};

  & svg {
    color: transparent;
    flex-shrink: 0;
    pointer-events: none;
    transform: ${({ position }) => {
      if (position === 'se') {
        return `translate(-${themeCssVariables.spacing[2]}, -${themeCssVariables.spacing[2]})`;
      }
      if (position === 'sw') {
        return `translate(${themeCssVariables.spacing[2]}, -${themeCssVariables.spacing[2]})`;
      }
      if (position === 'ne') {
        return `translate(-${themeCssVariables.spacing[2]}, ${themeCssVariables.spacing[2]})`;
      }
      if (position === 'nw') {
        return `translate(${themeCssVariables.spacing[2]}, ${themeCssVariables.spacing[2]})`;
      }
      return '';
    }};
  }

  :hover {
    svg {
      color: ${themeCssVariables.font.color.tertiary};
    }
  }
`;

const StyledVerticalHandle = styled.div`
  border-radius: ${themeCssVariables.border.radius.sm};
  height: ${themeCssVariables.spacing[5]};
  width: ${themeCssVariables.icon.stroke.lg}px;
`;

const StyledHorizontalHandle = styled.div`
  border-radius: ${themeCssVariables.border.radius.sm};
  height: ${themeCssVariables.icon.stroke.lg}px;
  width: ${themeCssVariables.spacing[5]};
`;

const StyledHorizontalHandleWrapper = styled.div<{
  widgetHandleAxis: WidgetHorizontalHandleAxis;
}>`
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: row-resize;
  transform: ${({ widgetHandleAxis }) =>
    widgetHandleAxis === 'n' ? 'translateY(-50%)' : 'translateY(50%)'};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]};

  :hover {
    & > div {
      background-color: ${themeCssVariables.font.color.tertiary};
    }
  }
`;

const StyledVerticalHandleWrapper = styled.div<{
  widgetHandleAxis: WidgetVerticalHandleAxis;
}>`
  cursor: col-resize;
  border-radius: ${themeCssVariables.border.radius.sm};
  transform: ${({ widgetHandleAxis }) =>
    widgetHandleAxis === 'w' ? 'translateX(-50%)' : 'translateX(50%)'};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]};

  :hover {
    & > div {
      background-color: ${themeCssVariables.font.color.tertiary};
    }
  }
`;

const StyledResizeHandleWrapper = styled.div<{
  widgetHandleAxis?: WidgetHandleAxis;
}>`
  position: absolute;
  ${({ widgetHandleAxis }) => {
    if (widgetHandleAxis === 'w') {
      return css`
        left: ${themeCssVariables.spacing[1.5]};
        top: 50%;
        transform: translateY(-50%);
      `;
    }
    if (widgetHandleAxis === 'e') {
      return css`
        right: ${themeCssVariables.spacing[1.5]};
        top: 50%;
        transform: translateY(-50%);
      `;
    }
    if (widgetHandleAxis === 'n') {
      return css`
        top: ${themeCssVariables.spacing[1.5]};
        left: 50%;
        transform: translateX(-50%);
      `;
    }
    if (widgetHandleAxis === 's') {
      return css`
        bottom: ${themeCssVariables.spacing[1.5]};
        left: 50%;
        transform: translateX(-50%);
      `;
    }
    if (widgetHandleAxis === 'se') {
      return css`
        bottom: 0;
        right: 0;
        transform: translate(
          ${themeCssVariables.spacing[1]},
          ${themeCssVariables.spacing[1]}
        );
      `;
    }
    if (widgetHandleAxis === 'sw') {
      return css`
        bottom: 0;
        left: 0;
        transform: translate(
          -${themeCssVariables.spacing[1]},
          ${themeCssVariables.spacing[1]}
        );
      `;
    }
    if (widgetHandleAxis === 'ne') {
      return css`
        right: 0;
        top: 0;
        transform: translate(
          ${themeCssVariables.spacing[1]},
          -${themeCssVariables.spacing[1]}
        );
      `;
    }
    if (widgetHandleAxis === 'nw') {
      return css`
        left: 0;
        top: 0;
        transform: translate(
          -${themeCssVariables.spacing[1]},
          -${themeCssVariables.spacing[1]}
        );
      `;
    }
    return '';
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
    const { theme } = useContext(ThemeContext);

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
          <StyledCornerIconWrapper cursor="nesw-resize" position="ne">
            <IconRadiusTopRight
              size={theme.icon.size.lg}
              stroke={theme.icon.stroke.lg}
            />
          </StyledCornerIconWrapper>
        )}
        {widgetHandleAxis === 'nw' && (
          <StyledCornerIconWrapper cursor="nwse-resize" position="nw">
            <IconRadiusTopLeft
              size={theme.icon.size.lg}
              stroke={theme.icon.stroke.lg}
            />
          </StyledCornerIconWrapper>
        )}
        {widgetHandleAxis === 'se' && (
          <StyledCornerIconWrapper cursor="nwse-resize" position="se">
            <IconRadiusBottomRight
              size={theme.icon.size.lg}
              stroke={theme.icon.stroke.lg}
            />
          </StyledCornerIconWrapper>
        )}
        {widgetHandleAxis === 'sw' && (
          <StyledCornerIconWrapper cursor="nesw-resize" position="sw">
            <IconRadiusBottomLeft
              size={theme.icon.size.lg}
              stroke={theme.icon.stroke.lg}
            />
          </StyledCornerIconWrapper>
        )}
      </StyledResizeHandleWrapper>
    );
  },
);
