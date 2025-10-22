import { ShimmeringText } from '@/ai/components/ShimmeringText';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { type DataMessagePart } from 'twenty-shared/ai';
import { IconCpu, IconSparkles } from 'twenty-ui/display';

const pulseAnimation = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const StyledRoutingContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.lighter};
  border: ${({ theme }) => `1px dashed ${theme.border.color.medium}`};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2, 3)};
  width: fit-content;
`;

const StyledIconContainer = styled.div<{ isLoading: boolean }>`
  align-items: center;
  animation: ${({ isLoading }) =>
    isLoading ? `${pulseAnimation} 2s ease-in-out infinite` : 'none'};
  color: ${({ theme }) => theme.color.blue};
  display: flex;
`;

const StyledText = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const RoutingStatusDisplay = ({
  data,
}: {
  data: DataMessagePart['routing-status'];
}) => {
  const isLoading = data.state === 'loading';

  if (data.state === 'error') {
    return null;
  }

  return (
    <StyledRoutingContainer>
      <StyledIconContainer isLoading={isLoading}>
        {isLoading ? <IconSparkles size={16} /> : <IconCpu size={16} />}
      </StyledIconContainer>
      {isLoading ? (
        <ShimmeringText>{data.text}</ShimmeringText>
      ) : (
        <StyledText>{data.text}</StyledText>
      )}
    </StyledRoutingContainer>
  );
};
