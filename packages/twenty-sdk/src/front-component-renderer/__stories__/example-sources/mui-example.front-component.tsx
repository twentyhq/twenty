import Button from '@mui/material/Button';
import { useState } from 'react';
import { defineFrontComponent } from '@/sdk';

const MuiComponent = () => {
  const [count, setCount] = useState(0);

  return (
    <div
      data-testid="mui-component"
      style={{
        padding: 24,
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      }}
    >
      <h2
        style={{
          fontSize: 20,
          fontWeight: 500,
          color: '#1976d2',
          marginBottom: 16,
        }}
      >
        Material UI Component
      </h2>
      <p
        data-testid="mui-count"
        style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}
      >
        Count: {count}
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button
          data-testid="mui-button"
          variant="contained"
          onClick={() => setCount((previous) => previous + 1)}
        >
          Increment
        </Button>
        <Button variant="outlined" onClick={() => setCount(0)}>
          Reset
        </Button>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'test-mui00-0000-0000-0000-000000000009',
  name: 'mui-component',
  description: 'A front component using Material UI',
  component: MuiComponent,
});
