import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexGroupCommonQueryVariables } from '@/object-record/record-index/hooks/useRecordIndexGroupCommonQueryVariables';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { useTriggerRecordTableRelationGroupsDiscovery } from '@/object-record/record-table/hooks/useTriggerRecordTableRelationGroupsDiscovery';
import { getQueryIdentifier } from '@/object-record/utils/getQueryIdentifier';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const RecordTableRelationGroupsDiscoveryEffect = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const isRelationGrouping =
    isDefined(recordIndexGroupFieldMetadataItem) &&
    isManyToOneRelationField(recordIndexGroupFieldMetadataItem);

  const { combinedFilters, orderBy } =
    useRecordIndexGroupCommonQueryVariables();

  const queryIdentifier = getQueryIdentifier({
    objectNameSingular: objectMetadataItem.nameSingular,
    filter: combinedFilters,
    orderBy,
  });

  const { triggerRecordTableRelationGroupsDiscovery } =
    useTriggerRecordTableRelationGroupsDiscovery();

  const discoveryKey = isRelationGrouping
    ? `${recordIndexGroupFieldMetadataItem.id}:${queryIdentifier}`
    : null;

  const [lastDiscoveryKey, setLastDiscoveryKey] = useState<string | null>(null);

  useEffect(() => {
    if (!isDefined(discoveryKey)) {
      return;
    }

    if (lastDiscoveryKey === discoveryKey) {
      return;
    }

    triggerRecordTableRelationGroupsDiscovery().then(
      (wasDiscoverySuccessful) => {
        if (wasDiscoverySuccessful) {
          setLastDiscoveryKey(discoveryKey);
        }
      },
    );
  }, [
    discoveryKey,
    lastDiscoveryKey,
    triggerRecordTableRelationGroupsDiscovery,
  ]);

  return null;
};
