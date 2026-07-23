import { useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar } from 'twenty-sdk/front-component';

const TriggerWorkflowRun = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleTrigger = async () => {
    setIsLoading(true);
    try {
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
    } catch {
      await enqueueSnackbar({
        message: 'Failed to create workflow run trigger',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <span style={{ fontSize: '13px', color: '#333' }}>
        Creates a workflow run trigger record, which fires the run-in-workflow
        logic function.
      </span>
      <button
        onClick={handleTrigger}
        disabled={isLoading}
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          background: isLoading ? '#f0f0f0' : '#fafafa',
          fontSize: '13px',
          cursor: isLoading ? 'default' : 'pointer',
        }}
      >
        {isLoading ? 'Triggering…' : 'Trigger workflow run'}
      </button>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: '108d9ddd-5213-421e-a0ab-926e5f02aed8',
  name: 'trigger-workflow-run',
  description:
    'Creates a workflowRunTrigger record to fire the run-in-workflow logic function',
  component: TriggerWorkflowRun,
});
