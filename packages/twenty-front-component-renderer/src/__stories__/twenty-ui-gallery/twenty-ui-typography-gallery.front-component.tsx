import { useState } from 'react';
import 'twenty-ui/style.css';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Section } from 'twenty-ui/components/layout';
import { VisuallyHiddenExample } from './visually-hidden-example';
import { Button } from 'twenty-ui/primitives/input';
import {
  Heading,
  Text,
  Shortcut,
  formatShortcut,
} from 'twenty-ui/primitives/typography';
import { ThemeProvider } from 'twenty-ui/theme';

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
    name: 'Shortcut',
    node: (
      <>
        <Shortcut shortcut={['Mod', 'K']} platform="mac" />
        <Shortcut shortcut={[['G'], ['P']]} sequenceJoinLabel="next" />
        <Text>
          {formatShortcut({
            shortcut: ['Mod', 'K'],
            platform: 'other',
          })}
        </Text>
      </>
    ),
  },
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
    name: 'VisuallyHidden',
    node: <VisuallyHiddenExample />,
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
