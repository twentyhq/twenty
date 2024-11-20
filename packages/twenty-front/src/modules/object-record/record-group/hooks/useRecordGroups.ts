import { useMemo } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { recordGroupDefinitionsComponentState } from '@/object-record/record-group/states/recordGroupDefinitionsComponentState';
import { sortRecordGroupDefinitions } from '@/object-record/record-group/utils/sortRecordGroupDefinitions';
import { recordIndexRecordGroupSortComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupSortComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

type UseRecordGroupsParams = {
  objectNameSingular: string;
};

export const useRecordGroups = ({
  objectNameSingular,
}: UseRecordGroupsParams) => {
  const recordGroupDefinitions = useRecoilComponentValueV2(
    recordGroupDefinitionsComponentState,
  );

  const recordGroupSort = useRecoilComponentValueV2(
    recordIndexRecordGroupSortComponentState,
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const viewGroupFieldMetadataItem = useMemo(() => {
    if (recordGroupDefinitions.length === 0) return null;
    // We're assuming that all groups have the same fieldMetadataId for now
    const fieldMetadataId =
      'fieldMetadataId' in recordGroupDefinitions[0]
        ? recordGroupDefinitions[0].fieldMetadataId
        : null;

    if (!fieldMetadataId) return null;

    return objectMetadataItem.fields.find(
      (field) => field.id === fieldMetadataId,
    );
  }, [objectMetadataItem, recordGroupDefinitions]);

  const visibleRecordGroups = useMemo(
    () => sortRecordGroupDefinitions(recordGroupDefinitions, recordGroupSort),
    [recordGroupDefinitions, recordGroupSort],
  );

  const hiddenRecordGroups = useMemo(
    () => recordGroupDefinitions.filter((boardGroup) => !boardGroup.isVisible),
    [recordGroupDefinitions],
  );

  return {
    hiddenRecordGroups,
    visibleRecordGroups,
    viewGroupFieldMetadataItem,
  };
};
