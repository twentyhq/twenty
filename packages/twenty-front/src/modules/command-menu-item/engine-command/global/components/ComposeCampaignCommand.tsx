import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
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
    const campaign = await createMessageCampaign({ id: campaignId });

    if (isDefined(campaign)) {
      navigateApp(
        AppPath.RecordShowPage,
        {
          objectNameSingular: CoreObjectNameSingular.MessageCampaign,
          objectRecordId: campaignId,
        },
        undefined,
        { state: { isNewRecord: true, objectRecordId: campaignId } },
      );
    }
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} ready />;
};
