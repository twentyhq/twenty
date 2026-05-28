import { MAX_EMAIL_RECIPIENTS } from 'twenty-shared/constants';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useOpenComposeCampaignInSidePanel } from '@/side-panel/hooks/useOpenComposeCampaignInSidePanel';

export const SendCampaignCommand = () => {
  const { openComposeCampaignInSidePanel } =
    useOpenComposeCampaignInSidePanel();

  const { objectMetadataItem, selectedRecords, graphqlFilter } =
    useHeadlessCommandContextApi();

  const objectNameSingular = objectMetadataItem?.nameSingular ?? null;
  const isPerson = objectNameSingular === CoreObjectNameSingular.Person;

  // Campaign is bulk-only in v1 — selecting a single Person should still work,
  // but in practice it's a tool for selections.
  const { records: personRecords, loading } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Person,
    filter: graphqlFilter ?? undefined,
    recordGqlFields: { id: true },
    limit: MAX_EMAIL_RECIPIENTS,
    skip: !isPerson,
  });

  const recipientPersonIds = isPerson
    ? personRecords.map((record) => record.id).filter(isDefined)
    : selectedRecords.map((record) => record.id).filter(isDefined);

  const handleExecute = () => {
    if (recipientPersonIds.length === 0) {
      return;
    }

    openComposeCampaignInSidePanel({
      recipientPersonIds,
    });
  };

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={handleExecute}
      ready={!loading}
    />
  );
};
