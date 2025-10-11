import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { forwardRef } from 'react';
import { IconBorderCornerSquare } from 'twenty-ui/display';

type PageLayoutGridResizeHandleProps = {
  handleAxis?: string;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
  onMouseUp?: React.MouseEventHandler<HTMLDivElement>;
  onTouchEnd?: React.TouchEventHandler<HTMLDivElement>;
  className?: string;
  style?: React.CSSProperties;
};

const StyledIcon = styled(IconBorderCornerSquare)`
  bottom: ${({ theme }) => theme.spacing(1)};
  rotate: 180deg;
  cursor: nwse-resize;
  position: absolute;
  right: ${({ theme }) => theme.spacing(1)};
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
        color={theme.font.color.extraLight}
      />
    </div>
  );
});

PageLayoutGridResizeHandle.displayName = 'PageLayoutGridResizeHandle';
