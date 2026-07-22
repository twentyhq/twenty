import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const ComposeCampaignCommand = () => {
  const navigateApp = useNavigateApp();

  const { createOneRecord: createMessageCampaign } = useCreateOneRecord({
    objectNameSingular: 'messageCampaign',
  });

  const handleExecute = async () => {
    const campaign = await createMessageCampaign({ id: v4() });

    if (isDefined(campaign)) {
      navigateApp(AppPath.RecordShowPage, {
        objectNameSingular: 'messageCampaign',
        objectRecordId: campaign.id,
      });
    }
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} ready />;
};
