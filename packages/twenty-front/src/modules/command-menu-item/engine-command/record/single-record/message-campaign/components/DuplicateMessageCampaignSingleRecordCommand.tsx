import { t } from '@lingui/core/macro';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const DuplicateMessageCampaignSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const campaignId = selectedRecords[0]?.id;
  const navigateApp = useNavigateApp();

  // The selection only carries the fields of the view, so the copy reads the
  // full record.
  const { record: campaign } = useFindOneRecord<MessageCampaign>({
    objectNameSingular: CoreObjectNameSingular.MessageCampaign,
    objectRecordId: campaignId,
  });

  const { createOneRecord: createMessageCampaign } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.MessageCampaign,
  });

  if (!isDefined(campaignId)) {
    throw new Error('Record ID is required to duplicate the campaign');
  }

  const handleExecute = async () => {
    if (!isDefined(campaign)) {
      return;
    }

    const duplicatedCampaign = await createMessageCampaign({
      name: t`${campaign.name} (copy)`,
      subject: campaign.subject,
      bodyTemplate: campaign.bodyTemplate,
      fromAddress: campaign.fromAddress,
      listId: campaign.listId,
      unsubscribeTopicId: campaign.unsubscribeTopicId,
    });

    if (isDefined(duplicatedCampaign)) {
      navigateApp(AppPath.RecordShowPage, {
        objectNameSingular: CoreObjectNameSingular.MessageCampaign,
        objectRecordId: duplicatedCampaign.id,
      });
    }
  };

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={handleExecute}
      ready={isDefined(campaign)}
    />
  );
};
