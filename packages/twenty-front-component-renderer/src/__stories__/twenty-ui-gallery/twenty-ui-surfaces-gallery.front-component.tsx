import { defineFrontComponent } from 'twenty-sdk/define';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { Button } from 'twenty-ui/primitives/input';
import { Card, Tooltip } from 'twenty-ui/primitives/surfaces';
import { ThemeProvider } from 'twenty-ui/theme';

import {
  ComponentGallery,
  type GalleryEntry,
} from '../shared/front-components/component-gallery';

const SURFACES_ENTRIES: GalleryEntry[] = [
  {
    name: 'Tooltip',
    node: (
      <Tooltip content="Tooltip content">
        <span>
          <Button>Tooltip anchor</Button>
        </span>
      </Tooltip>
    ),
  },
  {
    name: 'Card.Root',
    node: <Card.Root>Card body</Card.Root>,
  },
  {
    name: 'Card.Content',
    node: <Card.Content>Card content</Card.Content>,
  },
  {
    name: 'Card.Footer',
    node: <Card.Footer>Card footer</Card.Footer>,
  },
  {
    name: 'Card.Header',
    node: <Card.Header>Card header</Card.Header>,
  },
  {
    name: 'OverflowingTextWithTooltip',
    node: <OverflowingTextWithTooltip text="Some overflowing text" />,
  },
];

const SurfacesGallery = () => (
  <ThemeProvider colorScheme="light" applyToRoot={false}>
    <ComponentGallery
      title="twenty-ui/primitives/surfaces"
      entries={SURFACES_ENTRIES}
    />
  </ThemeProvider>
);

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000105',
  name: 'twenty-ui-surfaces-gallery',
  description:
    'Renders every twenty-ui/primitives/surfaces component in the sandbox',
  component: SurfacesGallery,
});
