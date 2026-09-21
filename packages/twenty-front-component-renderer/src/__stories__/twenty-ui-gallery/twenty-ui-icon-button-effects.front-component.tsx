import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { IconButton } from 'twenty-ui/components';
import { IconPlus, IconSearch } from 'twenty-ui/icon';
import { ThemeProvider } from 'twenty-ui/theme-constants';
import 'twenty-ui/style.css';

const IconButtonEffectsExample = () => {
  const [activations, setActivations] = useState(0);
  const handleClick = () => setActivations((count) => count + 1);

  return (
    <ThemeProvider colorScheme="light">
      <IconButton
        variant="surface"
        elevated
        size="sm"
        aria-label="Add widget"
        onClick={handleClick}
      >
        <IconPlus />
      </IconButton>
      <IconButton
        variant="surface"
        elevated
        size="sm"
        aria-label="Disabled widget action"
        disabled
        onClick={handleClick}
      >
        <IconPlus />
      </IconButton>
      <IconButton
        variant="surface"
        elevated
        size="sm"
        aria-label="Saving widget"
        loading
        onClick={handleClick}
      >
        <IconPlus />
      </IconButton>
      <IconButton
        aria-label="Browse widgets"
        href="https://twenty.com"
        target="_blank"
        rel="noreferrer"
        size="md"
      >
        <IconSearch />
      </IconButton>
      <IconButton aria-label="Elevated action" elevated>
        <IconSearch />
      </IconButton>
      <IconButton aria-label="Surface only" variant="surface">
        <IconSearch />
      </IconButton>
      <output aria-label="Widget activations">{activations}</output>
    </ThemeProvider>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'b0f2a49f-a4a9-4f80-8d2d-5fb1d3223607',
  name: 'twenty-ui-icon-button-effects',
  description:
    'Independent icon button appearance effects and interactions in the sandbox',
  component: IconButtonEffectsExample,
});
