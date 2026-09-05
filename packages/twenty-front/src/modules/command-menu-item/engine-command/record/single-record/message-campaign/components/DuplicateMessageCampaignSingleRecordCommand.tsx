import { t } from '@lingui/core/macro';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useLazyFindOneRecord } from '@/object-record/hooks/useLazyFindOneRecord';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const DuplicateMessageCampaignSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const campaignId = selectedRecords[0]?.id;
  const navigateApp = useNavigateApp();

  const { findOneRecord: findCampaign } = useLazyFindOneRecord<MessageCampaign>(
    { objectNameSingular: CoreObjectNameSingular.MessageCampaign },
  );

  const { createOneRecord: createMessageCampaign } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.MessageCampaign,
  });

  if (!isDefined(campaignId)) {
    throw new Error('Record ID is required to duplicate the campaign');
  }

  const handleExecute = async () => {
    // The selection only carries the fields of the current view, so the copy
    // reads the full record first.
    let campaign: MessageCampaign | undefined;

    await findCampaign({
      objectRecordId: campaignId,
      onCompleted: (record) => {
        campaign = record;
      },
    });

    if (!isDefined(campaign)) {
      return;
    }

    const duplicatedCampaignId = v4();

    await createMessageCampaign({
      id: duplicatedCampaignId,
      name: t`${campaign.name} (copy)`,
      subject: campaign.subject,
      bodyTemplate: campaign.bodyTemplate,
      fromAddress: campaign.fromAddress,
      listId: campaign.listId,
      unsubscribeTopicId: campaign.unsubscribeTopicId,
    });

    navigateApp(AppPath.RecordShowPage, {
      objectNameSingular: CoreObjectNameSingular.MessageCampaign,
      objectRecordId: duplicatedCampaignId,
    });
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} ready />;
};
