import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { CompanyDuplicateWarningModal } from '@/object-record/components/CompanyDuplicateWarningModal';
import { useBuildRecordInputFromRLSPredicates } from '@/object-record/hooks/useBuildRecordInputFromRLSPredicates';
import { useCheckDuplicateCompanies } from '@/object-record/hooks/useCheckDuplicateCompanies';
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
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { useStore } from 'jotai';
import { useCallback, useState } from 'react';
import { AppPath } from 'twenty-shared/types';
import { findByProperty, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { getConflictingRecordFromApolloError } from '~/utils/get-conflicting-record-from-apollo-error.util';

type UseCreateNewIndexRecordProps = {
  objectMetadataItem: ObjectMetadataItem;
};

type PendingDuplicateWarningState = {
  duplicates: ObjectRecord[];
  errorMessage?: string;
  recordInput: Partial<ObjectRecord>;
  resolve: (record: ObjectRecord | undefined) => void;
};

const getCompanyDuplicateSearchInput = (
  recordInput: Partial<ObjectRecord>,
): { domainName?: string; name?: string } => {
  const { domainName, name } = recordInput;

  const companyDomainName =
    typeof domainName === 'string'
      ? domainName
      : typeof domainName === 'object' &&
          domainName !== null &&
          'primaryLinkUrl' in domainName
        ? domainName.primaryLinkUrl
        : undefined;

  return {
    domainName: companyDomainName,
    name: typeof name === 'string' ? name : undefined,
  };
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

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();
  const { closeCommandMenu } = useCommandMenu();
  const [pendingDuplicateWarningState, setPendingDuplicateWarningState] =
    useState<PendingDuplicateWarningState | null>(null);

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

  const { checkDuplicateCompanies } = useCheckDuplicateCompanies();
  const { enqueueErrorSnackBar } = useSnackBar();

  const performCreateNewIndexRecord = useCallback(
    async (mergedRecordInput: Partial<ObjectRecord>) => {
      const recordId = v4();
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

          if (mergedRecordInput.position === 'first') {
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
      closeCommandMenu,
      createOneRecord,
      navigate,
      objectMetadataItem,
      openRecordInCommandMenu,
      openRecordTitleCell,
      recordGroupDefinitions,
      recordIndexGroupFieldMetadataItem,
      recordIndexRecordIdsByGroupCallbackState,
      store,
      upsertRecordsInStore,
    ],
  );

  const handleCancelDuplicateWarning = useCallback(() => {
    pendingDuplicateWarningState?.resolve(undefined);
    setPendingDuplicateWarningState(null);
  }, [pendingDuplicateWarningState]);

  const handleContinueAnyway = useCallback(async () => {
    if (!pendingDuplicateWarningState) {
      return;
    }

    const pendingRecordInput = pendingDuplicateWarningState.recordInput;
    const resolve = pendingDuplicateWarningState.resolve;

    setPendingDuplicateWarningState(null);

    try {
      const createdRecord = await performCreateNewIndexRecord(pendingRecordInput);

      resolve(createdRecord);
    } catch (error) {
      if (getConflictingRecordFromApolloError(error as any)) {
        enqueueErrorSnackBar({
          apolloError: error as any,
        });
        resolve(undefined);

        return;
      }

      throw error;
    }
  }, [
    enqueueErrorSnackBar,
    pendingDuplicateWarningState,
    performCreateNewIndexRecord,
  ]);

  const handleRetryDuplicateCheck = useCallback(async () => {
    if (!pendingDuplicateWarningState) {
      return;
    }

    try {
      const duplicates = await checkDuplicateCompanies(
        getCompanyDuplicateSearchInput(pendingDuplicateWarningState.recordInput),
      );

      if (duplicates.length === 0) {
        const pendingRecordInput = pendingDuplicateWarningState.recordInput;
        const resolve = pendingDuplicateWarningState.resolve;

        setPendingDuplicateWarningState(null);

        const createdRecord =
          await performCreateNewIndexRecord(pendingRecordInput);

        resolve(createdRecord);

        return;
      }

      setPendingDuplicateWarningState((currentState) =>
        currentState
          ? {
              ...currentState,
              duplicates,
              errorMessage: undefined,
            }
          : null,
      );
    } catch {
      setPendingDuplicateWarningState((currentState) =>
        currentState
          ? {
              ...currentState,
              duplicates: [],
              errorMessage: 'Unable to check for duplicates',
            }
          : null,
      );
    }
  }, [
    checkDuplicateCompanies,
    pendingDuplicateWarningState,
    performCreateNewIndexRecord,
  ]);

  const createNewIndexRecord = useCallback(
    async (recordInput?: Partial<ObjectRecord>) => {
      const recordInputFromRLSPredicates = buildRecordInputFromRLSPredicates();
      const recordInputFromFilters = buildRecordInputFromFilters();

      const mergedRecordInput = {
        ...recordInputFromRLSPredicates,
        ...recordInputFromFilters,
        ...recordInput,
      };

      if (objectMetadataItem.nameSingular !== 'company') {
        return performCreateNewIndexRecord(mergedRecordInput);
      }

      try {
        const duplicates = await checkDuplicateCompanies(
          getCompanyDuplicateSearchInput(mergedRecordInput),
        );

        if (duplicates.length === 0) {
          return performCreateNewIndexRecord(mergedRecordInput);
        }

        return await new Promise<ObjectRecord | undefined>((resolve) => {
          setPendingDuplicateWarningState({
            duplicates,
            errorMessage: undefined,
            recordInput: mergedRecordInput,
            resolve,
          });
        });
      } catch {
        return await new Promise<ObjectRecord | undefined>((resolve) => {
          setPendingDuplicateWarningState({
            duplicates: [],
            errorMessage: 'Unable to check for duplicates',
            recordInput: mergedRecordInput,
            resolve,
          });
        });
      }
    },
    [
      buildRecordInputFromFilters,
      buildRecordInputFromRLSPredicates,
      checkDuplicateCompanies,
      objectMetadataItem.nameSingular,
      performCreateNewIndexRecord,
    ],
  );

  return {
    companyDuplicateWarningModal: (
      <CompanyDuplicateWarningModal
        duplicates={pendingDuplicateWarningState?.duplicates ?? []}
        errorMessage={pendingDuplicateWarningState?.errorMessage}
        isOpen={isDefined(pendingDuplicateWarningState)}
        onCancel={handleCancelDuplicateWarning}
        onContinueAnyway={handleContinueAnyway}
        onNavigateToDuplicate={handleCancelDuplicateWarning}
        onRetry={handleRetryDuplicateCheck}
      />
    ),
    createNewIndexRecord,
  };
};
