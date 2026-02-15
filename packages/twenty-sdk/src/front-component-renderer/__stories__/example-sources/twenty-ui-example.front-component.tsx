import { defineFrontComponent } from '@/sdk';
import { useState } from 'react';
import { Button, H2Title, THEME_LIGHT, ThemeProvider } from 'twenty-sdk/ui';

const TwentyUiComponent = () => {
  const [count, setCount] = useState(0);

  return (
    <ThemeProvider theme={THEME_LIGHT}>
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
        <p
          data-testid="twenty-ui-count"
          style={{ fontSize: 24, fontWeight: 700 }}
        >
          Count: {count}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            data-testid="twenty-ui-button"
            title="Increment"
            onClick={() => setCount((previous) => previous + 1)}
          />
          <Button
            title="Reset"
            variant="secondary"
            onClick={() => setCount(0)}
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000010',
  name: 'twenty-ui-component',
  description: 'A front component using Twenty UI remote components',
  component: TwentyUiComponent,
});
