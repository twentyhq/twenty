import { isDefined } from 'twenty-shared/utils';

import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { recordTableRelationGroupsDiscoveredFieldIdComponentState } from '@/object-record/record-table/states/recordTableRelationGroupsDiscoveredFieldIdComponentState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const useIsRecordTableRelationGroupsLoading = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const hasRecordGroups = useAtomComponentSelectorValue(
    hasRecordGroupsComponentSelector,
    recordTableId,
  );

  const recordTableRelationGroupsDiscoveredFieldId = useAtomComponentStateValue(
    recordTableRelationGroupsDiscoveredFieldIdComponentState,
  );

  const isRelationGrouping =
    isDefined(recordIndexGroupFieldMetadataItem) &&
    isManyToOneRelationField(recordIndexGroupFieldMetadataItem);

  return (
    isRelationGrouping &&
    !hasRecordGroups &&
    recordTableRelationGroupsDiscoveredFieldId !==
      recordIndexGroupFieldMetadataItem.id
  );
};
