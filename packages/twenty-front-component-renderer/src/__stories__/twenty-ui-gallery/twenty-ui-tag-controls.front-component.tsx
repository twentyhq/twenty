import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Tag } from 'twenty-ui/data-display';
import { IconStar } from 'twenty-ui/icon';
import { ThemeProvider } from 'twenty-ui/theme-constants';
import 'twenty-ui/style.css';

import { ComponentGallery } from '../shared/front-components/component-gallery';

const TagControls = () => {
  const [activations, setActivations] = useState(0);
  const handleClick = () => setActivations((count) => count + 1);
  return (
    <ThemeProvider colorScheme="light">
      <ComponentGallery
        title="Tag controls"
        entries={[
          {
            name: 'Tag',
            node: (
              <>
                <Tag
                  color="blue"
                  onClick={handleClick}
                  startIcon={<IconStar />}
                >
                  Open tag
                </Tag>
                <Tag color="blue" onClick={handleClick} disabled>
                  Disabled tag
                </Tag>
                <Tag color="green" variant="outline">
                  Static tag
                </Tag>
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
  universalIdentifier: 'ce24297f-b8c4-4e55-85d2-032c21c9b85f',
  name: 'twenty-ui-tag-controls',
  description: 'Tag APIs and interactions in the sandbox',
  component: TagControls,
});
