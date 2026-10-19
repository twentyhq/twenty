import { useQuery } from '@apollo/client/react';
import { HeadlessNavigateEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessNavigateEngineCommand';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { useCoreWorkflowVersion } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersion';
import { AppPath, ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { GetCoreWorkflowDocument } from '~/generated/graphql';

const SeeRunsWorkflowVersionSingleRecordCommandContent = ({
  workflowId,
  workflowVersionId,
  workflowVersionLabel,
}: {
  workflowId: string;
  workflowVersionId: string;
  workflowVersionLabel: string | undefined;
}) => {
  const apolloCoreClient = useApolloCoreClient();
  const { data: coreWorkflowData, loading: coreWorkflowLoading } = useQuery(
    GetCoreWorkflowDocument,
    {
      client: apolloCoreClient,
      variables: { coreWorkflowId: workflowId },
    },
  );

  if (coreWorkflowLoading) {
    return null;
  }

  return (
    <HeadlessNavigateEngineCommand
      to={AppPath.RecordIndexPage}
      params={{ objectNamePlural: CoreObjectNamePlural.WorkflowRun }}
      queryParams={{
        filter: {
          coreWorkflowId: { [ViewFilterOperand.IS]: workflowId },
          coreWorkflowVersionId: { [ViewFilterOperand.IS]: workflowVersionId },
        },
        filterDisplayValue: {
          coreWorkflowId: {
            [ViewFilterOperand.IS]: coreWorkflowData?.coreWorkflow?.name,
          },
          coreWorkflowVersionId: {
            [ViewFilterOperand.IS]: workflowVersionLabel,
          },
        },
      }}
    />
  );
};

export const SeeRunsWorkflowVersionSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const { coreWorkflowVersion, loading } = useCoreWorkflowVersion(
    selectedRecords[0]?.coreWorkflowVersionId,
  );

  if (loading || !isDefined(coreWorkflowVersion)) {
    return null;
  }

  if (!isDefined(coreWorkflowVersion.coreWorkflowId)) {
    throw new Error(
      doNotTranslate(
        'Record ID and workflow ID are required to see runs workflow version',
      ),
    );
  }

  return (
    <SeeRunsWorkflowVersionSingleRecordCommandContent
      workflowId={coreWorkflowVersion.coreWorkflowId}
      workflowVersionId={coreWorkflowVersion.id}
      workflowVersionLabel={coreWorkflowVersion.label}
    />
  );
};
