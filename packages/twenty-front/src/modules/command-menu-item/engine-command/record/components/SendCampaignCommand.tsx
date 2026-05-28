import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useOpenComposeCampaignInSidePanel } from '@/side-panel/hooks/useOpenComposeCampaignInSidePanel';

export const SendCampaignCommand = () => {
  const { openComposeCampaignInSidePanel } =
    useOpenComposeCampaignInSidePanel();

  const { objectMetadataItem, graphqlFilter } = useHeadlessCommandContextApi();

  const objectNameSingular = objectMetadataItem?.nameSingular ?? null;
  const isPerson = objectNameSingular === CoreObjectNameSingular.Person;

  const handleExecute = () => {
    if (!isPerson || !isDefined(graphqlFilter)) {
      return;
    }

    // Forward the table's filter representation as-is. The backend uses the
    // same GraphqlQueryParser machinery the read API does to resolve it into
    // Person rows, so we never have to materialize the full ID list on the
    // client.
    openComposeCampaignInSidePanel({
      recipientFilter: graphqlFilter,
    });
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} ready />;
};
