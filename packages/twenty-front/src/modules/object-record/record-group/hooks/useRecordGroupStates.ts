import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { recordIndexGroupDefinitionsState } from '@/object-record/record-index/states/recordIndexGroupDefinitionsState';

type UseRecordGroupStatesParams = {
  objectNameSingular: string;
  viewBarId: string;
};

export const useRecordGroupStates = ({
  objectNameSingular,
}: UseRecordGroupStatesParams) => {
  const recordIndexGroupDefinitions = useRecoilValue(
    recordIndexGroupDefinitionsState,
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const viewGroupFieldMetadataItem = useMemo(() => {
    if (recordIndexGroupDefinitions.length === 0) return null;
    // We're assuming that all groups have the same fieldMetadataId for now
    const fieldMetadataId =
      'fieldMetadataId' in recordIndexGroupDefinitions[0]
        ? recordIndexGroupDefinitions[0].fieldMetadataId
        : null;

    if (!fieldMetadataId) return null;

    return objectMetadataItem.fields.find(
      (field) => field.id === fieldMetadataId,
    );
  }, [objectMetadataItem, recordIndexGroupDefinitions]);

  const visibleRecordGroups = useMemo(
    () =>
      recordIndexGroupDefinitions
        .filter((boardGroup) => boardGroup.isVisible)
        .sort(
          (boardGroupA, boardGroupB) =>
            boardGroupA.position - boardGroupB.position,
        ),
    [recordIndexGroupDefinitions],
  );

  const hiddenRecordGroups = useMemo(
    () =>
      recordIndexGroupDefinitions
        .filter((boardGroup) => !boardGroup.isVisible)
        .map((boardGroup) => ({
          ...boardGroup,
          isVisible: false,
        })),
    [recordIndexGroupDefinitions],
  );

  return {
    hiddenRecordGroups,
    visibleRecordGroups,
    viewGroupFieldMetadataItem,
  };
};
