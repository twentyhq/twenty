import { defineFrontComponent } from '@/sdk';

const StaticComponent = () => (
  <div
    data-testid="static-component"
    style={{
      padding: 20,
      backgroundColor: '#f0f4f8',
      borderRadius: 8,
      fontFamily: 'system-ui, sans-serif',
    }}
  >
    <h2 style={{ color: '#1a365d', fontWeight: 700, marginBottom: 12 }}>
      Static Component
    </h2>
    <p style={{ color: '#4a5568', fontSize: 14, lineHeight: 1.5 }}>
      This is a simple static component.
    </p>
    <span
      data-testid="styled-badge"
      style={{
        display: 'inline-block',
        padding: '4px 8px',
        backgroundColor: '#48bb78',
        color: 'white',
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      Styled Badge
    </span>
  </div>
);

export default defineFrontComponent({
  universalIdentifier: 'test-static-00000000-0000-0000-0000-000000000001',
  name: 'static-component',
  description: 'A simple static component for testing',
  component: StaticComponent,
});
