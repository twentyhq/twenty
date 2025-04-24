import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { useBuildRecordInputFromFilters } from '@/object-record/record-table/hooks/useBuildRecordInputFromFilters';
import { useRecordTitleCell } from '@/object-record/record-title-cell/hooks/useRecordTitleCell';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { AppPath } from '@/types/AppPath';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useCreateNewIndexRecord = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
    shouldMatchRootQueryFilter: true,
  });

  const navigate = useNavigateApp();

  const { openRecordTitleCell } = useRecordTitleCell();

  const { buildRecordInputFromFilters } = useBuildRecordInputFromFilters({
    objectMetadataItem,
  });

  const createNewIndexRecord = useRecoilCallback(
    ({ snapshot }) =>
      async (recordInput?: Partial<ObjectRecord>) => {
        const recordId = v4();
        const recordInputFromFilters = buildRecordInputFromFilters();

        const recordIndexOpenRecordIn = snapshot
          .getLoadable(recordIndexOpenRecordInState)
          .getValue();

        await createOneRecord({
          id: recordId,
          ...recordInputFromFilters,
          ...recordInput,
        });
        if (recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL) {
          openRecordInCommandMenu({
            recordId,
            objectNameSingular: objectMetadataItem.nameSingular,
            isNewRecord: true,
          });

          openRecordTitleCell({
            recordId,
            fieldMetadataId: objectMetadataItem.labelIdentifierFieldMetadataId,
            containerType: RecordTitleCellContainerType.ShowPage,
          });
        } else {
          navigate(AppPath.RecordShowPage, {
            objectNameSingular: objectMetadataItem.nameSingular,
            objectRecordId: recordId,
          });
        }
      },
    [
      buildRecordInputFromFilters,
      createOneRecord,
      navigate,
      objectMetadataItem.labelIdentifierFieldMetadataId,
      objectMetadataItem.nameSingular,
      openRecordInCommandMenu,
      openRecordTitleCell,
    ],
  );

  return {
    createNewIndexRecord,
  };
};
