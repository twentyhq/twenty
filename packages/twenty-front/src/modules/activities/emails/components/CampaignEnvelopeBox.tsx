import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { ComposerHeader } from '@/activities/components/ComposerHeader';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 100%;
`;

type CampaignEnvelopeBoxProps = {
  children: ReactNode;
  below?: ReactNode;
  onBlur?: () => void;
};

export const CampaignEnvelopeBox = ({
  children,
  below,
  onBlur,
}: CampaignEnvelopeBoxProps) => (
  <StyledContainer onBlur={onBlur}>
    <ComposerHeader>{children}</ComposerHeader>
    {below}
  </StyledContainer>
);
