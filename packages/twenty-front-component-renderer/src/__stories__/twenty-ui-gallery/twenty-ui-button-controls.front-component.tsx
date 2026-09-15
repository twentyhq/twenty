import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { LightButton, MainButton } from 'twenty-ui/components';
import { Button, ButtonGroup } from 'twenty-ui/primitives/input';
import { IconPlus } from 'twenty-ui/icon';
import { ThemeProvider } from 'twenty-ui/theme-constants';
import 'twenty-ui/style.css';

const ButtonControls = () => {
  const [activations, setActivations] = useState(0);
  const [loading, setLoading] = useState(false);
  const handleClick = () => setActivations((count) => count + 1);
  return (
    <ThemeProvider colorScheme="light">
      <Button
        color="accent"
        variant="solid"
        startIcon={<IconPlus />}
        onClick={handleClick}
      >
        Create record
      </Button>
      <Button disabled onClick={handleClick}>
        Disabled button
      </Button>
      <MainButton loading={loading} onClick={() => setLoading(true)}>
        Save changes
      </MainButton>
      <LightButton onClick={() => setLoading(false)}>
        Complete request
      </LightButton>
      <Button href="https://twenty.com" target="_blank" rel="noreferrer">
        Documentation
      </Button>
      <ButtonGroup aria-label="Actions" size="sm">
        <Button onClick={handleClick}>First action</Button>
        <Button onClick={handleClick}>Second action</Button>
      </ButtonGroup>
      <output aria-label="Activations">{activations}</output>
    </ThemeProvider>
  );
};

export default defineFrontComponent({
  universalIdentifier: '42d01c10-861e-4596-9178-d219f2800764',
  name: 'twenty-ui-button-controls',
  description: 'Button rendering and interactions in the sandbox',
  component: ButtonControls,
});
