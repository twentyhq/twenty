import { css, useTheme } from '@emotion/react';
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

const StyledBottomRightIcon = styled(IconRadiusBottomRight)`
  bottom: ${({ theme }) => theme.spacing(1)};
  cursor: nwse-resize;
  position: absolute;
  right: ${({ theme }) => theme.spacing(1)};
  color: transparent;
  display: none;

  :hover {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

const StyledBottomLeftIcon = styled(IconRadiusBottomLeft)`
  bottom: ${({ theme }) => theme.spacing(1)};
  cursor: nesw-resize;
  position: absolute;
  left: ${({ theme }) => theme.spacing(1)};
  color: transparent;
  display: none;

  :hover {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

const StyledTopLeftIcon = styled(IconRadiusTopLeft)`
  top: ${({ theme }) => theme.spacing(1)};
  cursor: nwse-resize;
  position: absolute;
  left: ${({ theme }) => theme.spacing(1)};
  color: transparent;
  display: none;

  :hover {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

const StyledTopRightIcon = styled(IconRadiusTopRight)`
  top: ${({ theme }) => theme.spacing(1)};
  cursor: nesw-resize;
  position: absolute;
  right: ${({ theme }) => theme.spacing(1)};
  color: transparent;
  display: none;

  :hover {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
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

export const PageLayoutGridResizeHandle = forwardRef<
  HTMLDivElement,
  PageLayoutGridResizeHandleProps
>((props, ref) => {
  const theme = useTheme();
  const {
    handleAxis = 'se',
    onMouseDown,
    onMouseUp,
    onTouchEnd,
    className,
    style,
  } = props;

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
      {handleAxis === 'se' && (
        <StyledBottomRightIcon
          size={theme.spacing(4)}
          stroke={theme.spacing(1)}
          className="widget-card-resize-handle"
        />
      )}
      {handleAxis === 'sw' && (
        <StyledBottomLeftIcon
          size={theme.spacing(4)}
          stroke={theme.spacing(1)}
          className="widget-card-resize-handle"
        />
      )}
      {handleAxis === 'ne' && (
        <StyledTopRightIcon
          size={theme.spacing(4)}
          stroke={theme.spacing(1)}
          className="widget-card-resize-handle"
        />
      )}
      {handleAxis === 'nw' && (
        <StyledTopLeftIcon
          size={theme.spacing(4)}
          stroke={theme.spacing(1)}
          className="widget-card-resize-handle"
        />
      )}
    </div>
  );
});
