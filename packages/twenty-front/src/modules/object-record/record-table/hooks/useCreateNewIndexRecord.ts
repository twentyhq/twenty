import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { useBuildRecordInputFromFilters } from '@/object-record/record-table/hooks/useBuildRecordInputFromFilters';
import { useRecordTitleCell } from '@/object-record/record-title-cell/hooks/useRecordTitleCell';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { canOpenObjectInSidePanel } from '@/object-record/utils/canOpenObjectInSidePanel';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { useRecoilCallback } from 'recoil';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { useNavigateApp } from '~/hooks/useNavigateApp';

type UseCreateNewIndexRecordProps = {
  objectMetadataItem: ObjectMetadataItem;
};

export const useCreateNewIndexRecord = ({
  objectMetadataItem,
}: UseCreateNewIndexRecordProps) => {
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

        const createdRecord = await createOneRecord({
          id: recordId,
          ...recordInputFromFilters,
          ...recordInput,
        });

        if (
          recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL &&
          canOpenObjectInSidePanel(objectMetadataItem.nameSingular)
        ) {
          openRecordInCommandMenu({
            recordId,
            objectNameSingular: objectMetadataItem.nameSingular,
            isNewRecord: true,
          });

          const labelIdentifierFieldMetadataItem =
            getLabelIdentifierFieldMetadataItem(objectMetadataItem);

          if (isDefined(labelIdentifierFieldMetadataItem)) {
            openRecordTitleCell({
              recordId,
              fieldName: labelIdentifierFieldMetadataItem.name,
              instanceId: getRecordFieldInputInstanceId({
                recordId,
                fieldName: labelIdentifierFieldMetadataItem.name,
                prefix: RecordTitleCellContainerType.PageHeader,
              }),
            });
          }
        } else {
          navigate(AppPath.RecordShowPage, {
            objectNameSingular: objectMetadataItem.nameSingular,
            objectRecordId: recordId,
          });
        }

        return createdRecord;
      },
    [
      buildRecordInputFromFilters,
      createOneRecord,
      navigate,
      objectMetadataItem,
      openRecordInCommandMenu,
      openRecordTitleCell,
    ],
  );

  return {
    createNewIndexRecord,
  };
};
