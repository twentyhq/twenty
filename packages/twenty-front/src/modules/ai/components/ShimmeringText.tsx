import styled from '@emotion/styled';

const StyledShimmeringText = styled.div`
  background: ${({ theme }) => theme.font.color.light}
    linear-gradient(
      90deg,
      ${({ theme }) => theme.font.color.light} 0%,
      ${({ theme }) => theme.font.color.primary} 50%,
      ${({ theme }) => theme.font.color.light} 100%
    );
  background-size: 200% 100%;
  background-position: -200% top;
  background-repeat: no-repeat;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer-wave 1s infinite linear;

  @keyframes shimmer-wave {
    0% {
      background-position: 200% top;
    }
    100% {
      background-position: -200% top;
    }
  }
`;

export const ShimmeringText = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <StyledShimmeringText className={className}>
      {children}
    </StyledShimmeringText>
  );
};
