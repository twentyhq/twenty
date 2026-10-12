import { styled } from '@linaria/react';
import { type MouseEventHandler, type ReactNode } from 'react';

import { ComposerFieldRow } from '@/activities/components/ComposerFieldRow';
import { ComposerHeader } from '@/activities/components/ComposerHeader';
import { COMPOSER_LABEL_MIN_WIDTH } from '@/activities/constants/ComposerLabelMinWidth';
import { type IconComponent } from 'twenty-ui/icon';

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

type CampaignEnvelopeRowProps = {
  label: string;
  Icon?: IconComponent;
  children: ReactNode;
  trailing?: ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

export const CampaignEnvelopeRow = ({
  label,
  Icon,
  children,
  trailing,
  onClick,
}: CampaignEnvelopeRowProps) => (
  <ComposerFieldRow
    label={label}
    Icon={Icon}
    trailing={trailing}
    onClick={onClick}
    labelMinWidth={COMPOSER_LABEL_MIN_WIDTH}
  >
    {children}
  </ComposerFieldRow>
);
