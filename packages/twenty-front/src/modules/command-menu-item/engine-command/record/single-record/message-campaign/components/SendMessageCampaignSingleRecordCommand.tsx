import { isDefined } from 'twenty-shared/utils';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useOpenSendCampaignInSidePanel } from '@/side-panel/hooks/useOpenSendCampaignInSidePanel';

export const SendMessageCampaignSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const campaignId = selectedRecords[0]?.id;
  const { openSendCampaignInSidePanel } = useOpenSendCampaignInSidePanel();

  if (!isDefined(campaignId)) {
    throw new Error('Record ID is required to send the campaign');
  }

  const handleExecute = () => openSendCampaignInSidePanel(campaignId);

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} ready />;
};
