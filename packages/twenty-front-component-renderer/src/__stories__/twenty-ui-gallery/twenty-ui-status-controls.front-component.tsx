import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Status } from 'twenty-ui/data-display';
import { ThemeProvider } from 'twenty-ui/theme-constants';
import 'twenty-ui/style.css';

import { ComponentGallery } from '../shared/front-components/component-gallery';

const StatusControls = () => {
  const [activations, setActivations] = useState(0);
  const handleClick = () => setActivations((count) => count + 1);
  return (
    <ThemeProvider colorScheme="light">
      <ComponentGallery
        title="Status controls"
        entries={[
          {
            name: 'Status',
            node: (
              <>
                <Status color="green" onClick={handleClick}>
                  Open status
                </Status>
                <Status color="green" onClick={handleClick} disabled>
                  Disabled status
                </Status>
                <Status color="blue" loading>
                  Loading status
                </Status>
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
  universalIdentifier: '5b533ab1-e117-4644-a22f-b00b095fd81e',
  name: 'twenty-ui-status-controls',
  description: 'Status APIs and interactions in the sandbox',
  component: StatusControls,
});
