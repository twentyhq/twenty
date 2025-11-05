import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { forwardRef } from 'react';
import {
  IconMinus,
  IconMinusVertical,
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

const StyledVerticalIcon = styled(IconMinusVertical)<{
  handleAxis: 'w' | 'e';
}>`
  ${({ theme, handleAxis }) =>
    handleAxis === 'w' &&
    css`
      left: ${theme.spacing(1)};
    `}
  ${({ theme, handleAxis }) =>
    handleAxis === 'e' &&
    css`
      right: ${theme.spacing(1)};
    `}

  top: 50%;
  transform: translateY(-50%);
  cursor: col-resize;
  position: absolute;
  color: transparent;
  display: none;

  :hover {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

const StyledHorizontalIcon = styled(IconMinus)<{
  handleAxis: 'n' | 's';
}>`
  ${({ theme, handleAxis }) =>
    handleAxis === 'n' &&
    css`
      top: ${theme.spacing(1)};
    `}
  ${({ theme, handleAxis }) =>
    handleAxis === 's' &&
    css`
      bottom: ${theme.spacing(1)};
    `}

  left: 50%;
  transform: translateX(-50%);
  cursor: row-resize;
  position: absolute;
  color: transparent;
  display: none;

  :hover {
    color: ${({ theme }) => theme.font.color.tertiary};
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
        <StyledVerticalIcon
          handleAxis={handleAxis}
          size={theme.spacing(4)}
          stroke={theme.spacing(1)}
          className="widget-card-resize-handle"
        />
      )}
      {(handleAxis === 'n' || handleAxis === 's') && (
        <StyledHorizontalIcon
          handleAxis={handleAxis}
          size={theme.spacing(4)}
          stroke={theme.spacing(1)}
          className="widget-card-resize-handle"
        />
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
