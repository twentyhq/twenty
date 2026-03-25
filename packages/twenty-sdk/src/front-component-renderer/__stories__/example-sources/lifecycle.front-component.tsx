import { defineFrontComponent } from '@/sdk';
import { useEffect, useState } from 'react';

const LifecycleComponent = () => {
  const [mounted, setMounted] = useState(false);
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTicks((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      data-testid="lifecycle-component"
      style={{
        padding: 20,
        backgroundColor: '#fffaf0',
        borderLeft: '4px solid #ed8936',
        borderRadius: '0 8px 8px 0',
      }}
    >
      <h2
        style={{
          color: '#c05621',
          fontWeight: 700,
          fontSize: 18,
          marginBottom: 16,
        }}
      >
        Lifecycle Component
      </h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <p
          data-testid="mounted-status"
          style={{
            padding: '8px 16px',
            borderRadius: 20,
            fontWeight: 600,
            fontSize: 14,
            backgroundColor: mounted ? '#c6f6d5' : '#fed7d7',
            color: mounted ? '#276749' : '#c53030',
          }}
        >
          {mounted ? 'Mounted' : 'Not mounted'}
        </p>
        <p
          data-testid="tick-count"
          style={{
            padding: '8px 16px',
            backgroundColor: '#bee3f8',
            color: '#2b6cb0',
            borderRadius: 20,
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Ticks: {ticks}
        </p>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'test-lif0-00000000-0000-0000-0000-000000000003',
  name: 'lifecycle-component',
  description: 'Component with useEffect lifecycle',
  component: LifecycleComponent,
});
