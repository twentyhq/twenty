import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// Widest label the campaign rows use ("Unsubscribe topic"), so every value
// starts on the same column.
export const CAMPAIGN_ENVELOPE_LABEL_MIN_WIDTH = '116px';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[6]} 0;
  width: 100%;
`;

// Tracks the body page below rather than the window, so the two read as one
// centred column. The body backdrop supplies the gap between them.
const StyledColumn = styled.div<{ $width: string }>`
  display: flex;
  flex-direction: column;
  max-width: ${({ $width }) => $width};
  min-width: 0;
  width: 100%;
`;

const StyledRows = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  /* Keeps the row hairlines from crossing the rounded corners. */
  overflow: hidden;
  width: 100%;
`;

type CampaignEnvelopeBoxProps = {
  width: string;
  children: ReactNode;
  below?: ReactNode;
  onBlur?: () => void;
};

// The shell both campaign headers share, so the draft and the sent view line up
// on the same column and cannot drift apart.
export const CampaignEnvelopeBox = ({
  width,
  children,
  below,
  onBlur,
}: CampaignEnvelopeBoxProps) => (
  <StyledContainer onBlur={onBlur}>
    <StyledColumn $width={width}>
      <StyledRows>{children}</StyledRows>
      {below}
    </StyledColumn>
  </StyledContainer>
);
