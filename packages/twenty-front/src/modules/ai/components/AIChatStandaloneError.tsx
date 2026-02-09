import styled from '@emotion/styled';

import { AIChatErrorRenderer } from '@/ai/components/AIChatErrorRenderer';

const StyledErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`;

type AIChatStandaloneErrorProps = {
  error: Error;
};

export const AIChatStandaloneError = ({
  error,
}: AIChatStandaloneErrorProps) => {
  return (
    <StyledErrorContainer>
      <AIChatErrorRenderer error={error} />
    </StyledErrorContainer>
  );
};
