import { GettingStartedDoneCard } from '@/getting-started/components/GettingStartedDoneCard';
import { useOpenGettingStartedWorkflow } from '@/getting-started/hooks/useOpenGettingStartedWorkflow';
import { CoreWorkflowStatusesCell } from '@/object-core/workflows/components/CoreWorkflowStatusesCell';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useQuery } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { IconSettingsAutomation } from 'twenty-ui/icon';
import { GetCoreWorkflowDocument } from '~/generated/graphql';
import { type GettingStartedStepDefinition } from '~/generated-metadata/graphql';

type GettingStartedWorkflowDoneCardProps = {
  stepDefinition: Pick<
    GettingStartedStepDefinition,
    'actionKey' | 'title' | 'doneWorkflowId'
  >;
};

export const GettingStartedWorkflowDoneCard = ({
  stepDefinition: { actionKey, title, doneWorkflowId },
}: GettingStartedWorkflowDoneCardProps) => {
  const apolloCoreClient = useApolloCoreClient();
  const { openGettingStartedWorkflow } =
    useOpenGettingStartedWorkflow(actionKey);
  const { data } = useQuery(GetCoreWorkflowDocument, {
    client: apolloCoreClient,
    variables: { coreWorkflowId: doneWorkflowId ?? '' },
    skip: !isDefined(doneWorkflowId),
  });
  const coreWorkflow = data?.coreWorkflow;

  return (
    <GettingStartedDoneCard
      Icon={IconSettingsAutomation}
      title={isNonEmptyString(coreWorkflow?.name) ? coreWorkflow.name : title}
      meta={
        isDefined(coreWorkflow) ? (
          <CoreWorkflowStatusesCell statuses={coreWorkflow.statuses} />
        ) : undefined
      }
      onClick={() => void openGettingStartedWorkflow()}
    />
  );
};
