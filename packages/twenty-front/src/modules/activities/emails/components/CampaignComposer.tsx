import { styled } from '@linaria/react';

import { CampaignComposerFields } from '@/activities/emails/components/CampaignComposerFields';
import { CampaignTestSendSection } from '@/activities/emails/components/CampaignTestSendSection';
import { useCampaignComposerState } from '@/activities/emails/hooks/useCampaignComposerState';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { t } from '@lingui/core/macro';
import { IconSend } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
`;

const StyledFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[2]};
`;

type CampaignComposerProps = {
  campaign: MessageCampaign;
  onSent?: () => void;
};

export const CampaignComposer = ({
  campaign,
  onSent,
}: CampaignComposerProps) => {
  const campaignState = useCampaignComposerState({ campaign, onSent });

  return (
    <StyledContainer>
      <CampaignComposerFields campaignState={campaignState} />
      <CampaignTestSendSection campaignState={campaignState} />
      <StyledFooter>
        <Button
          size="small"
          variant="primary"
          accent="blue"
          title={t`Send campaign`}
          Icon={IconSend}
          onClick={campaignState.handleSend}
          disabled={!campaignState.canSend}
        />
      </StyledFooter>
    </StyledContainer>
  );
};
