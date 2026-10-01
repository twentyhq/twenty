import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { HeadlessNavigateEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessNavigateEngineCommand';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useFindSelectedWorkflowRunCoreWorkflowIds } from '@/command-menu-item/engine-command/record/single-record/workflow-runs/hooks/useFindSelectedWorkflowRunCoreWorkflowIds';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useOpenCoreWorkflowVersionSidePanel } from '@/object-core/workflows/versions/hooks/useOpenCoreWorkflowVersionSidePanel';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { GetCoreWorkflowVersionDocument } from '~/generated/graphql';

export const SeeVersionWorkflowRunSingleRecordCommand = () => {
  const isCore = useIsWorkflowCoreEnabled();
  const { selectedRecords } = useHeadlessCommandContextApi();
  const selectedRecord = selectedRecords[0];
  const apolloCoreClient = useApolloCoreClient();
  const { openCoreWorkflowVersionSidePanel } =
    useOpenCoreWorkflowVersionSidePanel();
  const { findSelectedWorkflowRunCoreWorkflowIds } =
    useFindSelectedWorkflowRunCoreWorkflowIds();

  if (isCore) {
    return (
      <HeadlessEngineCommandWrapperEffect
        execute={async () => {
          const { coreWorkflowVersionId } =
            await findSelectedWorkflowRunCoreWorkflowIds();

          if (!isDefined(coreWorkflowVersionId)) {
            return;
          }

          const { data } = await apolloCoreClient.query({
            query: GetCoreWorkflowVersionDocument,
            variables: { coreWorkflowVersionId },
          });

          if (!isDefined(data?.coreWorkflowVersion)) {
            return;
          }

          openCoreWorkflowVersionSidePanel({
            coreWorkflowVersionId,
            pageTitle: data.coreWorkflowVersion.label,
          });
        }}
      />
    );
  }

  if (
    !isDefined(selectedRecord) ||
    !isDefined(selectedRecord?.workflowVersion?.id)
  ) {
    throw new Error('Selected record is required to see version workflow run');
  }

  return (
    <HeadlessNavigateEngineCommand
      to={AppPath.RecordShowPage}
      params={{
        objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
        objectRecordId: selectedRecord.workflowVersion.id,
      }}
    />
  );
};
