import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useBuildRecordInputFromRLSPredicates } from '@/object-record/hooks/useBuildRecordInputFromRLSPredicates';
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
import { useRecoilComponentFamilyStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateCallbackStateV2';
import { useRecoilComponentSelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useStore } from 'jotai';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { useCallback } from 'react';
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
  const recordGroupDefinitions = useRecoilComponentSelectorValueV2(
    recordGroupDefinitionsComponentSelector,
  );

  const store = useStore();
  const recordIndexRecordIdsByGroupCallbackState =
    useRecoilComponentFamilyStateCallbackStateV2(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const recordIndexGroupFieldMetadataItem = useRecoilComponentValueV2(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const { closeCommandMenu } = useCommandMenu();

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

  const { buildRecordInputFromRLSPredicates } =
    useBuildRecordInputFromRLSPredicates({
      objectMetadataItem,
    });

  const createNewIndexRecord = useCallback(
    async (recordInput?: Partial<ObjectRecord>) => {
      const recordId = v4();
      const recordInputFromRLSPredicates = buildRecordInputFromRLSPredicates();
      const recordInputFromFilters = buildRecordInputFromFilters();

      const mergedRecordInput = {
        ...recordInputFromRLSPredicates,
        ...recordInputFromFilters,
        ...recordInput,
      };

      const recordIndexOpenRecordIn = store.get(
        recordIndexOpenRecordInState.atom,
      );

      const createdRecord = await createOneRecord({
        id: recordId,
        ...mergedRecordInput,
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
            fieldMetadataItemId: labelIdentifierFieldMetadataItem.id,
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

        closeCommandMenu();
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
              labelIdentifierFieldName: labelIdentifierFieldMetadataItem?.name,
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
          const currentRecordIds = store.get(
            recordIndexRecordIdsByGroupCallbackState(recordGroup.id),
          );

          if (recordInput?.position === 'first') {
            const newRecordIds = [createdRecord.id, ...currentRecordIds];

            store.set(
              recordIndexRecordIdsByGroupCallbackState(recordGroup.id),
              newRecordIds,
            );
          } else {
            const newRecordIds = [...currentRecordIds, createdRecord.id];

            store.set(
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
      store,
      buildRecordInputFromRLSPredicates,
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
      closeCommandMenu,
    ],
  );

  return {
    createNewIndexRecord,
  };
};
