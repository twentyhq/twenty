import { useState } from 'react';
import { defineFrontComponent } from '@/sdk';
import { Button, Chip, ChipVariant, H2Title, Tag } from 'twenty-sdk/ui';

const TwentyUiComponent = () => {
  const [count, setCount] = useState(0);

  return (
    <div
      data-testid="twenty-ui-component"
      style={{
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <H2Title title="Twenty UI Component" />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Tag text={`Count: ${count}`} color="blue" />
        <Chip label="Remote Component" variant={ChipVariant.Highlighted} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button
          data-testid="twenty-ui-button"
          title="Increment"
          onClick={() => setCount((previous) => previous + 1)}
        />
        <Button title="Reset" variant="secondary" onClick={() => setCount(0)} />
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000010',
  name: 'twenty-ui-component',
  description: 'A front component using Twenty UI remote components',
  component: TwentyUiComponent,
});
