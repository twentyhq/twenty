import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Chip } from 'twenty-ui/data-display';
import { IconStar } from 'twenty-ui/icon';
import { ThemeProvider } from 'twenty-ui/theme-constants';
import 'twenty-ui/style.css';

import { ComponentGallery } from '../shared/front-components/component-gallery';

const ChipControls = () => {
  const [activations, setActivations] = useState(0);
  const handleClick = () => setActivations((count) => count + 1);
  return (
    <ThemeProvider colorScheme="light">
      <ComponentGallery
        title="Chip controls"
        entries={[
          {
            name: 'Chip',
            node: (
              <>
                <Chip
                  onClick={handleClick}
                  variant="soft"
                  startElement={<IconStar />}
                >
                  Open chip
                </Chip>
                <Chip onClick={handleClick} disabled>
                  Disabled chip
                </Chip>
                <Chip clickable={false} shape="round">
                  Static chip
                </Chip>
              </>
            ),
          },
        ]}
      />
      <output aria-label="Activations">{activations}</output>
    </ThemeProvider>
  );
};

export default defineFrontComponent({
  universalIdentifier: '38a631c4-a79b-4033-bf58-5c61d057d42b',
  name: 'twenty-ui-chip-controls',
  description: 'Chip APIs and interactions in the sandbox',
  component: ChipControls,
});
