import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
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
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { canOpenObjectInSidePanel } from '@/object-record/utils/canOpenObjectInSidePanel';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { useStore } from 'jotai';
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
  const recordGroupDefinitions = useAtomComponentSelectorValue(
    recordGroupDefinitionsComponentSelector,
  );

  const store = useStore();
  const recordIndexRecordIdsByGroupCallbackState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const { closeSidePanelMenu } = useSidePanelMenu();

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
    shouldMatchRootQueryFilter: true,
  });

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const navigate = useNavigateApp();

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
        openRecordInSidePanel({
          recordId,
          objectNameSingular: objectMetadataItem.nameSingular,
          isNewRecord: true,
        });
      } else {
        const labelIdentifierFieldMetadataItem =
          getLabelIdentifierFieldMetadataItem(objectMetadataItem);

        closeSidePanelMenu();
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
      openRecordInSidePanel,
      recordGroupDefinitions,
      recordIndexGroupFieldMetadataItem,
      recordIndexRecordIdsByGroupCallbackState,
      upsertRecordsInStore,
      closeSidePanelMenu,
    ],
  );

  return {
    createNewIndexRecord,
  };
};
