import { styled } from '@linaria/react';

const StyledEllipsisDisplay = styled.div<{ maxWidth?: number; color?: string }>`
  align-items: center;
  color: ${({ color }) => color ?? 'inherit'};
  display: flex;
  height: 20px;
  max-width: ${({ maxWidth }) => (maxWidth ? maxWidth + 'px' : '100%')};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

type EllipsisDisplayProps = {
  children: React.ReactNode;
  maxWidth?: number;
  className?: string;
  color?: string;
};

export const EllipsisDisplay = ({
  children,
  maxWidth,
  className,
  color,
}: EllipsisDisplayProps) => (
  <StyledEllipsisDisplay
    maxWidth={maxWidth}
    className={className}
    color={color}
  >
    {children}
  </StyledEllipsisDisplay>
);
