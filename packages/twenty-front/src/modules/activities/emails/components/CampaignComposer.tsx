import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

import { CampaignComposerFields } from '@/activities/emails/components/CampaignComposerFields';
import { CampaignTestSendSection } from '@/activities/emails/components/CampaignTestSendSection';
import { useCampaignComposerState } from '@/activities/emails/hooks/useCampaignComposerState';
import { useCampaignSendQuota } from '@/activities/emails/hooks/useCampaignSendQuota';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { t } from '@lingui/core/macro';
import { IconSend } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 0 auto;
  max-width: 720px;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledFooter = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[2]};
`;

const StyledQuotaHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-right: auto;
`;

const StyledQuotaSupportLink = styled.a`
  color: ${themeCssVariables.font.color.primary};
`;

const buildQuotaIncreaseSupportUrl = () =>
  `mailto:support@twenty.com?subject=${encodeURIComponent('Raise my email sending limit')}&body=${encodeURIComponent(
    'Hi, I would like a higher daily email sending limit.\n\nWhat we send and to whom:\n',
  )}`;

type CampaignComposerProps = {
  campaign: MessageCampaign;
  onSent?: () => void;
};

export const CampaignComposer = ({
  campaign,
  onSent,
}: CampaignComposerProps) => {
  const campaignState = useCampaignComposerState({ campaign, onSent });

  const sendQuota = useCampaignSendQuota();
  const remainingEmails = sendQuota?.remaining;
  const dailyEmailLimit = sendQuota?.dailyLimit;

  return (
    <StyledContainer>
      <CampaignComposerFields campaignState={campaignState} />
      <StyledFooter>
        {isDefined(remainingEmails) && isDefined(dailyEmailLimit) && (
          <StyledQuotaHint>
            {remainingEmails === 0 ? (
              <>
                {t`You’ve reached today’s limit.`}{' '}
                <StyledQuotaSupportLink
                  href={buildQuotaIncreaseSupportUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t`Contact support`}
                </StyledQuotaSupportLink>
              </>
            ) : remainingEmails === 1 ? (
              t`1 email left today`
            ) : (
              t`${remainingEmails} emails left today`
            )}
          </StyledQuotaHint>
        )}
        <CampaignTestSendSection campaignState={campaignState} />
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
