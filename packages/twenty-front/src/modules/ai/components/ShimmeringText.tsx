import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledShimmeringText = styled.div`
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer-wave 1s infinite linear;
  background: ${themeCssVariables.font.color.light}
    linear-gradient(
      90deg,
      ${themeCssVariables.font.color.light} 0%,
      ${themeCssVariables.font.color.primary} 50%,
      ${themeCssVariables.font.color.light} 100%
    );
  background-clip: text;
  background-position: -200% top;
  background-repeat: no-repeat;
  background-size: 200% 100%;

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
