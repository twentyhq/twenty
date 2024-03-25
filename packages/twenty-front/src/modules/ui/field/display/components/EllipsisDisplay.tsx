import styled from '@emotion/styled';

const StyledEllipsisDisplay = styled.div<{ maxWidth?: number }>`
  max-width: ${({ maxWidth }) => maxWidth ?? '100%'};
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
  <StyledEllipsisDisplay style={{ maxWidth }} className={className}>
    {children}
  </StyledEllipsisDisplay>
);
