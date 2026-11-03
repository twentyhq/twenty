import { type WorkflowCronTrigger } from '@/workflow/types/Workflow';
import { WorkflowEditTriggerCronForm } from '@/workflow/workflow-trigger/components/WorkflowEditTriggerCronForm';
import { convertScheduleToCronExpression } from '@/workflow/workflow-trigger/utils/convertScheduleToCronExpression';
import { useState } from 'react';
import { Text } from 'twenty-ui/primitives/typography';
import { Button } from 'twenty-ui/primitives/input';

type WorkflowEditTriggerCronExampleProps = {
  initialSettings: WorkflowCronTrigger['settings'];
};

export const WorkflowEditTriggerCronExample = ({
  initialSettings,
}: WorkflowEditTriggerCronExampleProps) => {
  const [trigger, setTrigger] = useState<WorkflowCronTrigger>({
    name: 'Schedule',
    type: 'CRON',
    settings: initialSettings,
  });
  return (
    <>
      <WorkflowEditTriggerCronForm
        trigger={trigger}
        triggerOptions={{ onTriggerUpdate: setTrigger }}
      />
      <Button
        onClick={() =>
          setTrigger((current) => ({
            ...current,
            settings: {
              type: 'HOURS',
              schedule: { hour: 2, minute: 15 },
              outputSchema: {},
            },
          }))
        }
      >
        Refresh schedule
      </Button>
      <Text>{`Saved schedule: ${convertScheduleToCronExpression(trigger)}`}</Text>
    </>
  );
};
