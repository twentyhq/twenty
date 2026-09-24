import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Section } from 'twenty-ui/components';
import { VisibilityHidden } from 'twenty-ui/primitives/accessibility';
import { Button } from 'twenty-ui/primitives/input';
import { Heading, Text } from 'twenty-ui/primitives/typography';
import { ThemeProvider } from 'twenty-ui/theme-constants';

import {
  ComponentGallery,
  type GalleryEntry,
} from '../shared/front-components/component-gallery';

const SectionExample = () => {
  const [activations, setActivations] = useState(0);

  return (
    <Section.Root>
      <Section.Header
        title="Workspace preferences"
        description="Manage the settings for your workspace."
        adornment={
          <Button onClick={() => setActivations((count) => count + 1)}>
            Edit workspace
          </Button>
        }
      />
      <Text aria-label="Workspace edits">{activations}</Text>
    </Section.Root>
  );
};

const TYPOGRAPHY_ENTRIES: GalleryEntry[] = [
  {
    name: 'Heading',
    node: (
      <Heading level={1} size="lg">
        Heading 1
      </Heading>
    ),
  },
  {
    name: 'Section',
    node: <SectionExample />,
  },
  {
    name: 'HeadingLevel',
    node: (
      <Heading level={3} size="sm">
        Heading 3
      </Heading>
    ),
  },
  {
    name: 'VisibilityHidden',
    node: <VisibilityHidden>Screen-reader only</VisibilityHidden>,
  },
];

const TypographyGallery = () => (
  <ThemeProvider colorScheme="light">
    <ComponentGallery
      title="twenty-ui/primitives/typography + accessibility"
      entries={TYPOGRAPHY_ENTRIES}
    />
  </ThemeProvider>
);

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000104',
  name: 'twenty-ui-typography-gallery',
  description:
    'Renders every twenty-ui/primitives/typography and accessibility component in the sandbox',
  component: TypographyGallery,
});
