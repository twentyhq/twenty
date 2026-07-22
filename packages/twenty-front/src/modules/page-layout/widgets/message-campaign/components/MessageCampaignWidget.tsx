import { styled } from '@linaria/react';

import { CampaignComposer } from '@/activities/emails/components/CampaignComposer';
import { MessageCampaignStats } from '@/activities/emails/components/MessageCampaignStats';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  height: 100%;
  margin: 0 auto;
  max-width: 640px;
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[4]};
  width: 100%;
`;

export const MessageCampaignWidget = () => {
  const targetRecord = useTargetRecord();

  const {
    record: campaign,
    loading: campaignLoading,
    refetch: refetchCampaign,
  } = useFindOneRecord<MessageCampaign & ObjectRecord>({
    objectNameSingular: 'messageCampaign',
    objectRecordId: targetRecord.id,
  });

  if (campaignLoading || !isDefined(campaign)) {
    return null;
  }

  // A campaign that has left DRAFT is already with the provider, so the page
  // reports on it instead of offering an editor that could not be applied.
  if (campaign.status !== 'DRAFT') {
    return (
      <StyledContainer>
        <MessageCampaignStats
          status={campaign.status}
          subject={campaign.subject}
          sentAt={campaign.sentAt}
          sentCount={campaign.sentCount ?? 0}
          failedCount={campaign.failedCount ?? 0}
          bouncedCount={campaign.bouncedCount ?? 0}
          complainedCount={campaign.complainedCount ?? 0}
        />
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <CampaignComposer
        key={campaign.id}
        campaign={campaign}
        onSent={() => refetchCampaign()}
      />
    </StyledContainer>
  );
};
