import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Avatar } from 'twenty-ui/data-display';
import { ThemeProvider } from 'twenty-ui/theme-constants';
import 'twenty-ui/style.css';

import { ComponentGallery } from '../shared/front-components/component-gallery';

const AvatarControls = () => {
  const [activations, setActivations] = useState(0);
  const handleClick = () => setActivations((count) => count + 1);
  return (
    <ThemeProvider colorScheme="light">
      <ComponentGallery
        title="Avatar controls"
        entries={[
          {
            name: 'AvatarImage',
            node: (
              <Avatar
                src="data:image/png;base64,invalid"
                name="Image fallback"
              />
            ),
          },
          {
            name: 'Avatar',
            node: (
              <>
                <Avatar
                  name="Jane"
                  onClick={handleClick}
                  shape="circle"
                  size="xl"
                />
                <Avatar name="Disabled avatar" onClick={handleClick} disabled />
                <Avatar name="Acme" variant="outline" size="lg" />
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
  universalIdentifier: '3216e89b-f4f5-45cd-afcd-0e8a4db46d05',
  name: 'twenty-ui-avatar-controls',
  description: 'Avatar APIs and interactions in the sandbox',
  component: AvatarControls,
});
