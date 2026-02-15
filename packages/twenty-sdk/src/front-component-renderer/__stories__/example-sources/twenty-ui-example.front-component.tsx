import { useState } from 'react';
import { defineFrontComponent } from '@/sdk';
import {
  Button,
  Chip,
  ChipVariant,
  H2Title,
  Status,
  Tag,
  THEME_LIGHT,
  ThemeProvider,
} from 'twenty-sdk/ui';

const CARD_STYLE = {
  padding: 24,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 16,
  fontFamily: 'system-ui, sans-serif',
  background: '#fafafa',
  borderRadius: 12,
  border: '2px solid #e4e4e7',
  maxWidth: 360,
};

const ROW_STYLE = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: 8,
  alignItems: 'center' as const,
};

const TwentyUiComponent = () => {
  const [count, setCount] = useState(0);

  return (
    <ThemeProvider theme={THEME_LIGHT}>
      <div data-testid="twenty-ui-component" style={CARD_STYLE}>
        <H2Title
          title="Twenty UI"
          description="The CRM's own component library with theme-aware styling."
        />
        <div style={ROW_STYLE}>
          <Tag color="green" text="Badge" variant="solid" />
          <Tag color="purple" text="Styled" variant="solid" />
          <Tag color="blue" text="Themed" variant="outline" />
        </div>
        <div style={ROW_STYLE}>
          <Status color="green" text="Online" />
          <Status color="red" text="Offline" />
          <Status color="orange" text="Away" />
        </div>
        <div style={ROW_STYLE}>
          <Chip label="Highlighted" variant={ChipVariant.Highlighted} />
          <Chip label="Rounded" variant={ChipVariant.Rounded} />
        </div>
        <p
          data-testid="twenty-ui-count"
          style={{ fontSize: 24, fontWeight: 800, margin: 0 }}
        >
          Count: {count}
        </p>
        <div style={ROW_STYLE}>
          <Button
            title="Increment"
            accent="blue"
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
