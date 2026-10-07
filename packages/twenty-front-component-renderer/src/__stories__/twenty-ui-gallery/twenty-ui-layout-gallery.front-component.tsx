import { defineFrontComponent } from 'twenty-sdk/define';
import 'twenty-ui/style.css';
import { Collapsible } from 'twenty-ui/primitives/layout';
import { ThemeProvider } from 'twenty-ui/theme';
import { SeparatorExample } from './separator-example';
import { ResizeHandleExample } from './resize-handle-example';
import { AnimatedIconCrossfadeExample } from './animated-icon-crossfade-example';

import {
  ComponentGallery,
  type GalleryEntry,
} from '../shared/front-components/component-gallery';

const LAYOUT_ENTRIES: GalleryEntry[] = [
  {
    name: 'Collapsible',
    node: <Collapsible isExpanded={true}>Expandable</Collapsible>,
  },
  {
    name: 'AnimatedIconCrossfade',
    node: <AnimatedIconCrossfadeExample />,
  },
  {
    name: 'Separator',
    node: <SeparatorExample />,
  },
  {
    name: 'ResizeHandle',
    node: <ResizeHandleExample />,
  },
];

const LayoutGallery = () => (
  <ThemeProvider colorScheme="light">
    <ComponentGallery
      title="twenty-ui/primitives/layout"
      entries={LAYOUT_ENTRIES}
    />
  </ThemeProvider>
);

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000103',
  name: 'twenty-ui-layout-gallery',
  description:
    'Renders every twenty-ui/primitives/layout component in the sandbox',
  component: LayoutGallery,
});
