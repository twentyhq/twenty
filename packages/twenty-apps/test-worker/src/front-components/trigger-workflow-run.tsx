import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Command, enqueueSnackbar } from 'twenty-sdk/front-component';

const TriggerWorkflowRun = () => {
  const execute = async () => {
    const client = new CoreApiClient();

    const triggerName = `Workflow trigger ${Math.random().toString(36).slice(2, 8)}`;

    await client.mutation({
      createWorkflowRunTrigger: {
        __args: { data: { name: triggerName } },
        id: true,
        name: true,
      },
    });

    await enqueueSnackbar({
      message: `Created ${triggerName}`,
      variant: 'success',
    });
  };

  return <Command execute={execute} />;
};

export default defineFrontComponent({
  universalIdentifier: '108d9ddd-5213-421e-a0ab-926e5f02aed8',
  name: 'trigger-workflow-run',
  description:
    'Creates a workflowRunTrigger record to fire the run-in-workflow logic function',
  component: TriggerWorkflowRun,
  isHeadless: true,
});
