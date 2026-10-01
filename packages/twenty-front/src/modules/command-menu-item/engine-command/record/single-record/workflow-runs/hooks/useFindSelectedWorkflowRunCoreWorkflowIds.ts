import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useLazyFindOneRecord } from '@/object-record/hooks/useLazyFindOneRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type CoreWorkflowIds = {
  coreWorkflowId?: string | null;
  coreWorkflowVersionId?: string | null;
};

export const useFindSelectedWorkflowRunCoreWorkflowIds = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const selectedRecord = selectedRecords[0];

  const { findOneRecord: findWorkflowRun } = useLazyFindOneRecord<
    ObjectRecord & CoreWorkflowIds
  >({
    objectNameSingular: CoreObjectNameSingular.WorkflowRun,
    recordGqlFields: {
      id: true,
      coreWorkflowId: true,
      coreWorkflowVersionId: true,
    },
  });

  const findSelectedWorkflowRunCoreWorkflowIds =
    async (): Promise<CoreWorkflowIds> => {
      if (
        isDefined(selectedRecord?.coreWorkflowId) &&
        isDefined(selectedRecord?.coreWorkflowVersionId)
      ) {
        return selectedRecord;
      }

      if (!isDefined(selectedRecord?.id)) {
        return {};
      }

      let workflowRun: CoreWorkflowIds = {};

      await findWorkflowRun({
        objectRecordId: selectedRecord.id,
        onCompleted: (record) => {
          workflowRun = record;
        },
      });

      return workflowRun;
    };

  return { findSelectedWorkflowRunCoreWorkflowIds };
};
