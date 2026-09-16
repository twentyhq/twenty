import { useState } from 'react';
import { Section } from 'twenty-ui/components';
import { Button } from 'twenty-ui/primitives/input';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  VisibilityHidden,
  VisibilityHiddenInput,
} from 'twenty-ui/primitives/accessibility';
import { ThemeProvider } from 'twenty-ui/theme-constants';
import {
  Heading,
  Text,
  Label,
  LinkifiedText,
  SeparatorLineText,
  StyledText,
  StyledTextContent,
  StyledTextWrapper,
} from 'twenty-ui/primitives/typography';

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
    name: 'Label',
    node: <Label variant="default">Label</Label>,
  },
  {
    name: 'LinkifiedText',
    node: <LinkifiedText text="Visit https://twenty.com now" />,
  },
  {
    name: 'SeparatorLineText',
    node: <SeparatorLineText>or</SeparatorLineText>,
  },
  {
    name: 'StyledText',
    node: <StyledText text="Styled text" />,
  },
  {
    name: 'StyledTextContent',
    node: <StyledTextContent>Content</StyledTextContent>,
  },
  {
    name: 'StyledTextWrapper',
    node: <StyledTextWrapper>Wrapper</StyledTextWrapper>,
  },
  {
    name: 'VisibilityHidden',
    node: <VisibilityHidden>Screen-reader only</VisibilityHidden>,
  },
  {
    name: 'VisibilityHiddenInput',
    node: <VisibilityHiddenInput readOnly value="" />,
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
