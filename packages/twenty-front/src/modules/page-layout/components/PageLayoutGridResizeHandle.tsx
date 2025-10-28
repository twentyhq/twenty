import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { forwardRef } from 'react';
import { IconRadiusBottomRight } from 'twenty-ui/display';

type PageLayoutGridResizeHandleProps = {
  handleAxis?: string;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
  onMouseUp?: React.MouseEventHandler<HTMLDivElement>;
  onTouchEnd?: React.TouchEventHandler<HTMLDivElement>;
  className?: string;
  style?: React.CSSProperties;
};

const StyledIcon = styled(IconRadiusBottomRight)`
  bottom: ${({ theme }) => theme.spacing(1)};
  cursor: nwse-resize;
  position: absolute;
  right: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.border.color.strong};
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

  if (handleAxis !== 'se') return null;

  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchEnd={onTouchEnd}
      className={className}
      style={style}
    >
      <StyledIcon
        size={theme.spacing(4)}
        stroke={theme.spacing(1)}
        className="widget-card-resize-handle"
      />
    </div>
  );
});
