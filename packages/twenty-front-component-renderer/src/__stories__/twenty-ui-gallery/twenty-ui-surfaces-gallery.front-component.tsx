import { defineFrontComponent } from 'twenty-sdk/define';
import { Button } from 'twenty-ui/primitives/input';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  OverflowingTextWithTooltip,
  Tooltip,
} from 'twenty-ui/primitives/surfaces';
import { ThemeProvider } from 'twenty-ui/theme-constants';

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
    name: 'Card',
    node: <Card>Card body</Card>,
  },
  {
    name: 'CardContent',
    node: <CardContent>Card content</CardContent>,
  },
  {
    name: 'CardFooter',
    node: <CardFooter>Card footer</CardFooter>,
  },
  {
    name: 'CardHeader',
    node: <CardHeader>Card header</CardHeader>,
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
