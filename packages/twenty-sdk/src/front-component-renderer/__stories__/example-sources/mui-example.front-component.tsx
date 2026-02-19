import Button from '@mui/material/Button';
import MuiChip from '@mui/material/Chip';
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
        backgroundColor: '#e3f2fd',
        border: '2px solid #42a5f5',
        borderRadius: 12,
        maxWidth: 360,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#1565c0',
          margin: 0,
        }}
      >
        Material UI
      </h2>
      <p
        style={{
          fontSize: 14,
          color: '#1976d2',
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        Google's design system with comprehensive component library.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <MuiChip label="Badge" color="primary" size="small" />
        <MuiChip label="Styled" color="secondary" size="small" />
        <MuiChip label="Material" color="success" size="small" />
      </div>
      <p
        data-testid="mui-count"
        style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#1565c0' }}
      >
        Count: {count}
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button
          data-testid="mui-button"
          variant="contained"
          size="small"
          onClick={() => setCount((previous) => previous + 1)}
        >
          Increment
        </Button>
        <Button variant="outlined" size="small" onClick={() => setCount(0)}>
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
