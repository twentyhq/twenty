import { useEffect } from 'react';

import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { filterAvailableTableColumns } from '@/object-record/utils/filterAvailableTableColumns';
import { availableBoardCardFieldsScopedState } from '@/ui/object/record-board/states/availableBoardCardFieldsScopedState';
import { useSetRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useSetRecoilScopedStateV2';
import { useViewBar } from '@/views/hooks/useViewBar';
import { ViewType } from '@/views/types/ViewType';

type HooksCompanyBoardEffectProps = {
  viewBarId: string;
};

export const HooksCompanyBoardEffect = ({
  viewBarId,
}: HooksCompanyBoardEffectProps) => {
  const {
    setAvailableFilterDefinitions,
    setAvailableSortDefinitions,
    setAvailableFieldDefinitions,
    setViewObjectMetadataId,
    setViewType,
  } = useViewBar({ viewBarId: viewBarId });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNamePlural: 'opportunities',
  });

  const { columnDefinitions, filterDefinitions, sortDefinitions } =
    useColumnDefinitionsFromFieldMetadata(objectMetadataItem);

  const setAvailableBoardCardFields = useSetRecoilScopedStateV2(
    availableBoardCardFieldsScopedState,
    'company-board-view',
  );

  useEffect(() => {
    if (!objectMetadataItem) {
      return;
    }
    setAvailableFilterDefinitions?.(filterDefinitions);
    setAvailableSortDefinitions?.(sortDefinitions);
    setAvailableFieldDefinitions?.(columnDefinitions);
  }, [
    columnDefinitions,
    filterDefinitions,
    objectMetadataItem,
    setAvailableFieldDefinitions,
    setAvailableFilterDefinitions,
    setAvailableSortDefinitions,
    sortDefinitions,
  ]);

  useEffect(() => {
    const availableTableColumns = columnDefinitions.filter(
      filterAvailableTableColumns,
    );

    setAvailableBoardCardFields(availableTableColumns);
  }, [columnDefinitions, setAvailableBoardCardFields]);

  useEffect(() => {
    if (!objectMetadataItem) {
      return;
    }
    setViewObjectMetadataId?.(objectMetadataItem.id);
    setViewType?.(ViewType.Kanban);
  }, [objectMetadataItem, setViewObjectMetadataId, setViewType]);

  // useEffect(() => {
  //   if (currentViewFields) {
  //     setBoardCardFields(
  //       mapViewFieldsToBoardFieldDefinitions(
  //         currentViewFields,
  //         columnDefinitions,
  //       ),
  //     );
  //   }
  // }, [columnDefinitions, currentViewFields, setBoardCardFields]);

  return <></>;
};
