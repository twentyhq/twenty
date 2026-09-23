import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useBuildRecordInputFromRLSPredicates } from '@/object-record/hooks/useBuildRecordInputFromRLSPredicates';
import { useRecordCreationForm } from '@/object-record/record-form/hooks/useRecordCreationForm';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { useResolveOpenRecordIn } from '@/object-record/record-index/hooks/useResolveOpenRecordIn';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { newRecordTitleCellToOpenState } from '@/object-record/record-title-cell/states/newRecordTitleCellToOpenState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type OnRecordCreated } from '@/object-record/types/OnRecordCreated';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { AppPath, OpenRecordIn } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { useNavigateApp } from '~/hooks/useNavigateApp';

type UseCreateNewRecordProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  buildRecordInput?: () => Partial<ObjectRecord>;
  onRecordCreated?: OnRecordCreated;
};

export const useCreateNewRecord = ({
  objectMetadataItem,
  buildRecordInput,
  onRecordCreated,
}: UseCreateNewRecordProps) => {
  const store = useStore();

  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const workspaceSurface = useWorkspaceSurface();

  const openRecordIn = useResolveOpenRecordIn(objectMetadataItem.nameSingular);

  const { closeSidePanelMenu } = useSidePanelMenu();

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
    shouldMatchRootQueryFilter: true,
  });

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const { requestRecordCreation } = useRecordCreationForm({
    objectMetadataItem,
  });

  const navigate = useNavigateApp();

  const { buildRecordInputFromRLSPredicates } =
    useBuildRecordInputFromRLSPredicates({
      objectMetadataItem,
    });

  const createRecord = useCallback(
    async (recordInput?: Partial<ObjectRecord>) => {
      const recordId = v4();
      const recordInputFromRLSPredicates = buildRecordInputFromRLSPredicates();
      const additionalRecordInput = buildRecordInput?.();

      const mergedRecordInput = {
        ...recordInputFromRLSPredicates,
        ...additionalRecordInput,
        ...recordInput,
      };

      const createdRecord = await createOneRecord({
        id: recordId,
        ...mergedRecordInput,
      });

      return createdRecord;
    },
    [buildRecordInputFromRLSPredicates, buildRecordInput, createOneRecord],
  );

  const createNewRecord = useCallback(
    async (recordInput?: Partial<ObjectRecord>) => {
      let submittedRecordInput = recordInput;

      const createdRecord = await requestRecordCreation({
        initialDraftRecord: {
          ...buildRecordInputFromRLSPredicates(),
          ...buildRecordInput?.(),
          ...recordInput,
        },
        createRecord: (draftRecord) => {
          submittedRecordInput = { ...recordInput, ...draftRecord };
          return createRecord(submittedRecordInput);
        },
      });

      if (!isDefined(createdRecord)) {
        return;
      }

      const recordId = createdRecord.id;

      const labelIdentifierFieldMetadataItem =
        getLabelIdentifierFieldMetadataItem(objectMetadataItem);

      const shouldOpenLabelIdentifierInEditMode =
        !isDefined(labelIdentifierFieldMetadataItem) ||
        !isDefined(
          submittedRecordInput?.[
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

      onRecordCreated?.({
        record: createdRecord,
        recordInput: submittedRecordInput,
      });
      upsertRecordsInStore({ partialRecords: [createdRecord] });

      return createdRecord;
    },
    [
      buildRecordInputFromRLSPredicates,
      buildRecordInput,
      createRecord,
      store,
      navigate,
      objectMetadataItem,
      openRecordInSidePanel,
      openRecordIn,
      closeSidePanelMenu,
      workspaceSurface.type,
      requestRecordCreation,
      onRecordCreated,
      upsertRecordsInStore,
    ],
  );

  return {
    createNewRecord,
  };
};
