import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useBuildRecordInputFromFilters } from '@/object-record/record-table/hooks/useBuildRecordInputFromFilters';
import { useRecordTitleCell } from '@/object-record/record-title-cell/hooks/useRecordTitleCell';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { canOpenObjectInSidePanel } from '@/object-record/utils/canOpenObjectInSidePanel';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { useRecoilCallback } from 'recoil';
import { AppPath } from 'twenty-shared/types';
import { findByProperty, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { useNavigateApp } from '~/hooks/useNavigateApp';

type UseCreateNewIndexRecordProps = {
  objectMetadataItem: ObjectMetadataItem;
};

export const useCreateNewIndexRecord = ({
  objectMetadataItem,
}: UseCreateNewIndexRecordProps) => {
  const recordGroupDefinitions = useRecoilComponentValue(
    recordGroupDefinitionsComponentSelector,
  );

  const recordIndexRecordIdsByGroupCallbackState =
    useRecoilComponentCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const recordIndexGroupFieldMetadataItem = useRecoilComponentValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
    shouldMatchRootQueryFilter: true,
  });

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const navigate = useNavigateApp();

  const { openRecordTitleCell } = useRecordTitleCell();

  const { buildRecordInputFromFilters } = useBuildRecordInputFromFilters({
    objectMetadataItem,
  });

  const createNewIndexRecord = useRecoilCallback(
    ({ snapshot, set }) =>
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
          const labelIdentifierFieldMetadataItem =
            getLabelIdentifierFieldMetadataItem(objectMetadataItem);

          navigate(
            AppPath.RecordShowPage,
            {
              objectNameSingular: objectMetadataItem.nameSingular,
              objectRecordId: recordId,
            },
            undefined,
            {
              state: {
                isNewRecord: true,
                objectRecordId: recordId,
                labelIdentifierFieldName:
                  labelIdentifierFieldMetadataItem?.name,
              },
            },
          );
        }

        if (isDefined(recordIndexGroupFieldMetadataItem)) {
          const recordGroup = recordGroupDefinitions.find(
            findByProperty(
              'value',
              createdRecord[recordIndexGroupFieldMetadataItem.name],
            ),
          );

          if (isDefined(recordGroup)) {
            const currentRecordIds = getSnapshotValue(
              snapshot,
              recordIndexRecordIdsByGroupCallbackState(recordGroup.id),
            );

            if (recordInput?.position === 'first') {
              const newRecordIds = [createdRecord.id, ...currentRecordIds];

              set(
                recordIndexRecordIdsByGroupCallbackState(recordGroup.id),
                newRecordIds,
              );
            } else {
              const newRecordIds = [...currentRecordIds, createdRecord.id];

              set(
                recordIndexRecordIdsByGroupCallbackState(recordGroup.id),
                newRecordIds,
              );
            }
          }
        }

        upsertRecordsInStore({ partialRecords: [createdRecord] });

        return createdRecord;
      },
    [
      buildRecordInputFromFilters,
      createOneRecord,
      navigate,
      objectMetadataItem,
      openRecordInCommandMenu,
      openRecordTitleCell,
      recordGroupDefinitions,
      recordIndexGroupFieldMetadataItem,
      recordIndexRecordIdsByGroupCallbackState,
      upsertRecordsInStore,
    ],
  );

  return {
    createNewIndexRecord,
  };
};
