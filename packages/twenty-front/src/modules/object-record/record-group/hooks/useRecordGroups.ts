import { useMemo } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { recordGroupDefinitionsComponentState } from '@/object-record/record-group/states/recordGroupDefinitionsComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type UseRecordGroupsParams = {
  objectNameSingular: string;
};

export const useRecordGroups = ({
  objectNameSingular,
}: UseRecordGroupsParams) => {
  const recordGroupDefinitions = useRecoilComponentValueV2(
    recordGroupDefinitionsComponentState,
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
    () =>
      recordGroupDefinitions
        .filter((boardGroup) => boardGroup.isVisible)
        .sort(
          (boardGroupA, boardGroupB) =>
            boardGroupA.position - boardGroupB.position,
        ),
    [recordGroupDefinitions],
  );

  const selectableFieldMetadataItems = useMemo(
    () =>
      objectMetadataItem.fields.filter(
        (field) => field.type === FieldMetadataType.Select,
      ),
    [objectMetadataItem.fields],
  );

  const hiddenRecordGroups = useMemo(
    () => recordGroupDefinitions.filter((boardGroup) => !boardGroup.isVisible),
    [recordGroupDefinitions],
  );

  return {
    hiddenRecordGroups,
    visibleRecordGroups,
    selectableFieldMetadataItems,
    viewGroupFieldMetadataItem,
  };
};
