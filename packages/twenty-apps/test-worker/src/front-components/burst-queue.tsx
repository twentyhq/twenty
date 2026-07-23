import { useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar } from 'twenty-sdk/front-component';

const DEFAULT_TRIGGER_COUNT = 10;

const BurstQueue = () => {
  const [count, setCount] = useState(DEFAULT_TRIGGER_COUNT);
  const [isLoading, setIsLoading] = useState(false);

  const handleBurst = async () => {
    setIsLoading(true);
    try {
      const client = new RestApiClient();

      await client.post('/s/trigger-sleep', { count });

      await enqueueSnackbar({
        message: `Triggered sleep logic function ${count} times`,
        variant: 'success',
      });
    } catch {
      await enqueueSnackbar({
        message: 'Failed to burst logic function queue',
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
      <label
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          fontSize: '13px',
          color: '#333',
        }}
      >
        Number of sleep executions
        <input
          type="number"
          min={1}
          value={count}
          onChange={(event) => setCount(Number(event.target.value))}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            fontSize: '13px',
          }}
        />
      </label>
      <button
        onClick={handleBurst}
        disabled={isLoading || count < 1}
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          background: isLoading ? '#f0f0f0' : '#fafafa',
          fontSize: '13px',
          cursor: isLoading ? 'default' : 'pointer',
        }}
      >
        {isLoading ? 'Bursting…' : 'Burst queue'}
      </button>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'e3ad1aa8-2a9f-451e-8b1b-e45e5e8cd246',
  name: 'burst-queue',
  description:
    'Asks for a number of executions and triggers the sleep logic function that many times',
  component: BurstQueue,
});
