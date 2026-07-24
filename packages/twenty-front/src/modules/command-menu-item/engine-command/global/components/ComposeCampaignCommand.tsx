import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const ComposeCampaignCommand = () => {
  const navigateApp = useNavigateApp();

  const { createOneRecord: createMessageCampaign } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.MessageCampaign,
  });

  const handleExecute = async () => {
    const campaignId = v4();

    await createMessageCampaign({ id: campaignId });

    navigateApp(
      AppPath.RecordShowPage,
      {
        objectNameSingular: CoreObjectNameSingular.MessageCampaign,
        objectRecordId: campaignId,
      },
      undefined,
      { state: { isNewRecord: true, objectRecordId: campaignId } },
    );
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} ready />;
};
