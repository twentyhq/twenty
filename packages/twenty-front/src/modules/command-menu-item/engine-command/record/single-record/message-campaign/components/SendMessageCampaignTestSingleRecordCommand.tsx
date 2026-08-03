import { isDefined } from 'twenty-shared/utils';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useOpenSendCampaignTestInSidePanel } from '@/side-panel/hooks/useOpenSendCampaignTestInSidePanel';

export const SendMessageCampaignTestSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const campaignId = selectedRecords[0]?.id;
  const { openSendCampaignTestInSidePanel } =
    useOpenSendCampaignTestInSidePanel();

  if (!isDefined(campaignId)) {
    throw new Error('Record ID is required to send a test email');
  }

  const handleExecute = () => openSendCampaignTestInSidePanel(campaignId);

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} ready />;
};
