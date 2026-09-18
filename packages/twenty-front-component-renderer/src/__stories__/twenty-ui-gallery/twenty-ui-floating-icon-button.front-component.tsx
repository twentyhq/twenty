import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { FloatingIconButton } from 'twenty-ui/components';
import { IconPlus, IconSearch } from 'twenty-ui/icon';
import { ThemeProvider } from 'twenty-ui/theme-constants';
import 'twenty-ui/style.css';

const FloatingIconButtonExample = () => {
  const [activations, setActivations] = useState(0);
  const handleClick = () => setActivations((count) => count + 1);

  return (
    <ThemeProvider colorScheme="light">
      <FloatingIconButton aria-label="Add widget" onClick={handleClick}>
        <IconPlus />
      </FloatingIconButton>
      <FloatingIconButton
        aria-label="Disabled widget action"
        disabled
        onClick={handleClick}
      >
        <IconPlus />
      </FloatingIconButton>
      <FloatingIconButton
        aria-label="Saving widget"
        loading
        onClick={handleClick}
      >
        <IconPlus />
      </FloatingIconButton>
      <FloatingIconButton
        aria-label="Browse widgets"
        href="https://twenty.com"
        target="_blank"
        rel="noreferrer"
        size="md"
        elevated={false}
        blur={false}
      >
        <IconSearch />
      </FloatingIconButton>
      <output aria-label="Widget activations">{activations}</output>
    </ThemeProvider>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'b0f2a49f-a4a9-4f80-8d2d-5fb1d3223607',
  name: 'twenty-ui-floating-icon-button',
  description:
    'Floating icon button appearance and interactions in the sandbox',
  component: FloatingIconButtonExample,
});
