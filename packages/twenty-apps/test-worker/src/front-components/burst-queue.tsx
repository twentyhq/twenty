import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Command, enqueueSnackbar } from 'twenty-sdk/front-component';

const TRIGGER_COUNT = 200;

const BurstQueue = () => {
  const execute = async () => {
    const client = new RestApiClient();

    await client.post('/s/trigger-sleep', { count: TRIGGER_COUNT });

    await enqueueSnackbar({
      message: `Created ${TRIGGER_COUNT} trigger records, ${TRIGGER_COUNT} sleep jobs enqueued`,
      variant: 'success',
    });
  };

  return <Command execute={execute} />;
};

export default defineFrontComponent({
  universalIdentifier: 'e3ad1aa8-2a9f-451e-8b1b-e45e5e8cd246',
  name: 'burst-queue',
  description:
    'Creates 30 trigger records to flood the logic function queue with sleep jobs',
  component: BurstQueue,
  isHeadless: true,
});
