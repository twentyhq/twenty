import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useBuildRecordInputFromRLSPredicates } from '@/object-record/hooks/useBuildRecordInputFromRLSPredicates';
import { useRecordCreationForm } from '@/object-record/record-form/hooks/useRecordCreationForm';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { useResolveOpenRecordIn } from '@/object-record/record-index/hooks/useResolveOpenRecordIn';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useBuildRecordInputFromFilters } from '@/object-record/record-table/hooks/useBuildRecordInputFromFilters';
import { newRecordTitleCellToOpenState } from '@/object-record/record-title-cell/states/newRecordTitleCellToOpenState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { AppPath, OpenRecordIn } from 'twenty-shared/types';
import { findByProperty, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { useNavigateApp } from '~/hooks/useNavigateApp';

type UseCreateNewIndexRecordProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  instanceId?: string;
};

export const useCreateNewIndexRecord = ({
  objectMetadataItem,
  instanceId,
}: UseCreateNewIndexRecordProps) => {
  const recordGroupDefinitions = useAtomComponentSelectorValue(
    recordGroupDefinitionsComponentSelector,
    instanceId,
  );

  const store = useStore();
  const recordIndexRecordIdsByGroupCallbackState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
      instanceId,
    );

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
    instanceId,
  );

  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const workspaceSurface = useWorkspaceSurface();

  const openRecordIn = useResolveOpenRecordIn(objectMetadataItem.nameSingular);

  const { closeSidePanelMenu } = useSidePanelMenu();

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
    shouldMatchRootQueryFilter: true,
  });

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const { shouldOpenRecordCreationForm, requestRecordCreationDraft } =
    useRecordCreationForm({ objectMetadataItem });

  const navigate = useNavigateApp();

  const { buildRecordInputFromFilters } = useBuildRecordInputFromFilters({
    objectMetadataItem,
    instanceId,
  });

  const { buildRecordInputFromRLSPredicates } =
    useBuildRecordInputFromRLSPredicates({
      objectMetadataItem,
    });

  const createIndexRecord = useCallback(
    async (recordInput?: Partial<ObjectRecord>) => {
      const recordId = v4();
      const recordInputFromRLSPredicates = buildRecordInputFromRLSPredicates();
      const recordInputFromFilters = buildRecordInputFromFilters();

      const mergedRecordInput = {
        ...recordInputFromRLSPredicates,
        ...recordInputFromFilters,
        ...recordInput,
      };

      const createdRecord = await createOneRecord({
        id: recordId,
        ...mergedRecordInput,
      });

      const labelIdentifierFieldMetadataItem =
        getLabelIdentifierFieldMetadataItem(objectMetadataItem);

      const shouldOpenLabelIdentifierInEditMode =
        !isDefined(labelIdentifierFieldMetadataItem) ||
        !isDefined(
          recordInput?.[
            getFieldMetadataItemGqlFieldName(labelIdentifierFieldMetadataItem)
          ],
        );

      if (workspaceSurface.type === 'side-panel') {
        openRecordInSidePanel({
          recordId,
          objectNameSingular: objectMetadataItem.nameSingular,
          isNewRecord: shouldOpenLabelIdentifierInEditMode,
          resetNavigationStack: false,
        });
      } else if (openRecordIn === OpenRecordIn.SIDE_PANEL) {
        openRecordInSidePanel({
          recordId,
          objectNameSingular: objectMetadataItem.nameSingular,
          isNewRecord: shouldOpenLabelIdentifierInEditMode,
        });
      } else {
        if (
          shouldOpenLabelIdentifierInEditMode &&
          isDefined(labelIdentifierFieldMetadataItem)
        ) {
          store.set(newRecordTitleCellToOpenState.atom, {
            recordId,
            fieldName: labelIdentifierFieldMetadataItem.name,
          });
        }

        closeSidePanelMenu();
        navigate(AppPath.RecordShowPage, {
          objectNameSingular: objectMetadataItem.nameSingular,
          objectRecordId: recordId,
        });
      }

      if (isDefined(recordIndexGroupFieldMetadataItem)) {
        const recordGroup = recordGroupDefinitions.find(
          findByProperty(
            'value',
            createdRecord[
              getFieldMetadataItemGqlFieldName(
                recordIndexGroupFieldMetadataItem,
              )
            ],
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
      openRecordIn,
      recordGroupDefinitions,
      recordIndexGroupFieldMetadataItem,
      recordIndexRecordIdsByGroupCallbackState,
      upsertRecordsInStore,
      closeSidePanelMenu,
      workspaceSurface.type,
    ],
  );

  const createNewIndexRecord = useCallback(
    async (recordInput?: Partial<ObjectRecord>) => {
      if (!shouldOpenRecordCreationForm) {
        return createIndexRecord(recordInput);
      }

      const draftRecord = await requestRecordCreationDraft(recordInput);

      if (!isDefined(draftRecord)) {
        return undefined;
      }

      return createIndexRecord({ ...draftRecord, ...recordInput });
    },
    [
      createIndexRecord,
      requestRecordCreationDraft,
      shouldOpenRecordCreationForm,
    ],
  );

  return {
    createNewIndexRecord,
  };
};
