import { css, type Theme, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { forwardRef } from 'react';
import {
  IconRadiusBottomLeft,
  IconRadiusBottomRight,
  IconRadiusTopLeft,
  IconRadiusTopRight,
} from 'twenty-ui/display';

type PageLayoutGridResizeHandleProps = {
  handleAxis?: string;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
  onMouseUp?: React.MouseEventHandler<HTMLDivElement>;
  onTouchEnd?: React.TouchEventHandler<HTMLDivElement>;
  className?: string;
  style?: React.CSSProperties;
};

const createCornerIconStyle =
  (vertical: 'top' | 'bottom', horizontal: 'left' | 'right') =>
  ({ theme }: { theme: Theme }) => css`
    left: ${vertical === 'top' ? theme.spacing(1) : 'unset'};
    right: ${vertical === 'bottom' ? theme.spacing(1) : 'unset'};
    top: ${horizontal === 'left' ? theme.spacing(1) : 'unset'};
    bottom: ${horizontal === 'right' ? theme.spacing(1) : 'unset'};

    cursor: ${vertical === 'top' || horizontal === 'left'
      ? 'nwse-resize'
      : 'nesw-resize'};
    position: absolute;
    color: transparent;
    display: none;

    :hover {
      color: ${theme.font.color.tertiary};
    }
  `;

const StyledBottomRightIcon = styled(IconRadiusBottomRight)`
  ${createCornerIconStyle('bottom', 'right')}
`;

const StyledBottomLeftIcon = styled(IconRadiusBottomLeft)`
  ${createCornerIconStyle('bottom', 'left')}
`;

const StyledTopLeftIcon = styled(IconRadiusTopLeft)`
  ${createCornerIconStyle('top', 'left')}
`;

const StyledTopRightIcon = styled(IconRadiusTopRight)`
  ${createCornerIconStyle('top', 'right')}
`;

const StyledVerticalHandle = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  height: ${({ theme }) => theme.spacing(5)};
  width: 3px;
`;

const StyledHorizontalHandle = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  height: 3px;
  width: ${({ theme }) => theme.spacing(5)};
`;

const StyledHorizontalHandleWrapper = styled.div<{
  handleAxis: 'n' | 's';
}>`
  ${({ theme, handleAxis }) =>
    handleAxis === 'n' &&
    css`
      top: ${theme.spacing(2)};
    `}
  ${({ theme, handleAxis }) =>
    handleAxis === 's' &&
    css`
      bottom: ${theme.spacing(2)};
    `}

  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: row-resize;
  left: 50%;
  transform: ${({ handleAxis }) =>
    handleAxis === 'n'
      ? 'translateY(-50%) translateX(-50%)'
      : 'translateY(50%) translateX(-50%)'};
  position: absolute;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(2)};

  :hover {
    & > div {
      background-color: ${({ theme }) => theme.font.color.tertiary};
    }
  }
`;

const StyledVerticalHandleWrapper = styled.div<{
  handleAxis: 'w' | 'e';
}>`
  ${({ theme, handleAxis }) =>
    handleAxis === 'w' &&
    css`
      left: ${theme.spacing(2)};
    `}
  ${({ theme, handleAxis }) =>
    handleAxis === 'e' &&
    css`
      right: ${theme.spacing(2)};
    `}

  cursor: col-resize;
  position: absolute;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  top: 50%;
  transform: ${({ handleAxis }) =>
    handleAxis === 'w'
      ? 'translateY(-50%) translateX(-50%)'
      : 'translateY(-50%) translateX(50%)'};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(2)};

  :hover {
    & > div {
      background-color: ${({ theme }) => theme.font.color.tertiary};
    }
  }
`;

const CORNER_ICONS = {
  se: StyledBottomRightIcon,
  sw: StyledBottomLeftIcon,
  ne: StyledTopRightIcon,
  nw: StyledTopLeftIcon,
};

export const PageLayoutGridResizeHandle = forwardRef<
  HTMLDivElement,
  PageLayoutGridResizeHandleProps
>(
  (
    { handleAxis, onMouseDown, onMouseUp, onTouchEnd, className, style },
    ref,
  ) => {
    const theme = useTheme();

    const CornerIcon = CORNER_ICONS[handleAxis as keyof typeof CORNER_ICONS];

    return (
      <div
        ref={ref}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
        className={className}
        style={style}
      >
        {(handleAxis === 'w' || handleAxis === 'e') && (
          <StyledVerticalHandleWrapper handleAxis={handleAxis}>
            <StyledVerticalHandle className="widget-card-resize-handle" />
          </StyledVerticalHandleWrapper>
        )}
        {(handleAxis === 'n' || handleAxis === 's') && (
          <StyledHorizontalHandleWrapper handleAxis={handleAxis}>
            <StyledHorizontalHandle className="widget-card-resize-handle" />
          </StyledHorizontalHandleWrapper>
        )}
        {CornerIcon && (
          <CornerIcon
            size={theme.spacing(4)}
            stroke={theme.spacing(1)}
            className="widget-card-resize-handle"
          />
        )}
      </div>
    );
  },
);
