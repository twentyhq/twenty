import { styled } from '@linaria/react';
import { forwardRef, useContext } from 'react';
import {
  IconRadiusBottomLeft,
  IconRadiusBottomRight,
  IconRadiusTopLeft,
  IconRadiusTopRight,
} from 'twenty-ui/display';
import { ResizeHandle } from 'twenty-ui/layout';
import { themeCssVariables, ThemeContext } from 'twenty-ui/theme-constants';
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

  top: ${({ widgetHandleAxis }) => {
    if (widgetHandleAxis === 'w' || widgetHandleAxis === 'e') return '50%';
    if (widgetHandleAxis === 'n') return themeCssVariables.spacing[1.5];
    if (widgetHandleAxis === 'ne' || widgetHandleAxis === 'nw') return '0';
    return 'auto';
  }};

  bottom: ${({ widgetHandleAxis }) => {
    if (widgetHandleAxis === 's') return themeCssVariables.spacing[1.5];
    if (widgetHandleAxis === 'se' || widgetHandleAxis === 'sw') return '0';
    return 'auto';
  }};

  left: ${({ widgetHandleAxis }) => {
    if (widgetHandleAxis === 'w') return themeCssVariables.spacing[1.5];
    if (widgetHandleAxis === 'n' || widgetHandleAxis === 's') return '50%';
    if (widgetHandleAxis === 'sw' || widgetHandleAxis === 'nw') return '0';
    return 'auto';
  }};

  right: ${({ widgetHandleAxis }) => {
    if (widgetHandleAxis === 'e') return themeCssVariables.spacing[1.5];
    if (widgetHandleAxis === 'se' || widgetHandleAxis === 'ne') return '0';
    return 'auto';
  }};

  transform: ${({ widgetHandleAxis }) => {
    switch (widgetHandleAxis) {
      case 'w':
      case 'e':
        return 'translateY(-50%)';
      case 'n':
      case 's':
        return 'translateX(-50%)';
      case 'se':
        return `translate(${themeCssVariables.spacing[1]}, ${themeCssVariables.spacing[1]})`;
      case 'sw':
        return `translate(-${themeCssVariables.spacing[1]}, ${themeCssVariables.spacing[1]})`;
      case 'ne':
        return `translate(${themeCssVariables.spacing[1]}, -${themeCssVariables.spacing[1]})`;
      case 'nw':
        return `translate(-${themeCssVariables.spacing[1]}, -${themeCssVariables.spacing[1]})`;
      default:
        return 'none';
    }
  }};
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
          <ResizeHandle
            style={{
              cursor: 'row-resize',
              transform:
                widgetHandleAxis === 'n'
                  ? 'translateY(-50%)'
                  : 'translateY(50%)',
            }}
          />
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
