import { styled } from '@linaria/react';
import { type MouseEventHandler, type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { ComposerFieldRow } from '@/activities/components/ComposerFieldRow';

// Widest campaign row label ("Unsubscribe topic").
const CAMPAIGN_ENVELOPE_LABEL_MIN_WIDTH = '116px';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: ${themeCssVariables.spacing[3]} 0;
  width: 100%;
`;

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

type CampaignEnvelopeRowProps = {
  label: string;
  children: ReactNode;
  trailing?: ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

export const CampaignEnvelopeRow = ({
  label,
  children,
  trailing,
  onClick,
}: CampaignEnvelopeRowProps) => (
  <ComposerFieldRow
    label={label}
    trailing={trailing}
    onClick={onClick}
    labelMinWidth={CAMPAIGN_ENVELOPE_LABEL_MIN_WIDTH}
  >
    {children}
  </ComposerFieldRow>
);
