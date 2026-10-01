import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useLazyFindOneRecord } from '@/object-record/hooks/useLazyFindOneRecord';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type WorkflowRunCoreIdField = 'coreWorkflowId' | 'coreWorkflowVersionId';

export const useFindSelectedWorkflowRunCoreId = (
  field: WorkflowRunCoreIdField,
) => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const selectedRecord = selectedRecords[0];

  const { findOneRecord: findWorkflowRun } = useLazyFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkflowRun,
    recordGqlFields: { id: true, [field]: true },
  });

  const findSelectedWorkflowRunCoreId = async (): Promise<
    string | null | undefined
  > => {
    if (isDefined(selectedRecord?.[field])) {
      return selectedRecord[field];
    }

    if (!isDefined(selectedRecord?.id)) {
      return undefined;
    }

    let coreId: string | null | undefined;

    await findWorkflowRun({
      objectRecordId: selectedRecord.id,
      onCompleted: (workflowRun) => {
        coreId = workflowRun[field];
      },
    });

    return coreId;
  };

  return { findSelectedWorkflowRunCoreId };
};
