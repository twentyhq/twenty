import { styled } from '@linaria/react';

const StyledEllipsisDisplay = styled.div<{ maxWidth?: number }>`
  align-items: center;
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
};

export const EllipsisDisplay = ({
  children,
  maxWidth,
  className,
}: EllipsisDisplayProps) => (
  <StyledEllipsisDisplay maxWidth={maxWidth} className={className}>
    {children}
  </StyledEllipsisDisplay>
);
