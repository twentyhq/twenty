import { type Preview } from '@storybook/react-vite';
import { ThemeProvider } from 'twenty-ui/theme';
import { useState } from 'react';

import { FrontComponentPortalContainerContext } from '@/host/contexts/FrontComponentPortalContainerContext';

import 'twenty-ui/theme-light.css';
import 'twenty-ui/theme-dark.css';

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      const [portalContainer, setPortalContainer] =
        useState<HTMLDivElement | null>(null);

      return (
        <ThemeProvider colorScheme="light">
          <FrontComponentPortalContainerContext.Provider
            value={portalContainer}
          >
            <div ref={setPortalContainer}>
              <Story />
            </div>
          </FrontComponentPortalContainerContext.Provider>
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
