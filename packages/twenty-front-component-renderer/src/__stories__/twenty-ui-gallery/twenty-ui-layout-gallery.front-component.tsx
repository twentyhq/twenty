import { defineFrontComponent } from 'twenty-sdk/define';
import { AnimatedIconCrossfade } from 'twenty-ui/components';
import { IconHeart, IconStar } from 'twenty-ui/icon';
import {
  AnimatedExpandableContainer,
  HorizontalSeparator,
  ResizeHandle,
} from 'twenty-ui/primitives/layout';
import { ThemeProvider } from 'twenty-ui/theme-constants';

import {
  ComponentGallery,
  type GalleryEntry,
} from '../shared/front-components/component-gallery';

const LAYOUT_ENTRIES: GalleryEntry[] = [
  {
    name: 'AnimatedExpandableContainer',
    node: (
      <AnimatedExpandableContainer isExpanded={true}>
        Expandable
      </AnimatedExpandableContainer>
    ),
  },
  {
    name: 'AnimatedIconCrossfade',
    node: (
      <AnimatedIconCrossfade
        isActive={true}
        ActiveIcon={IconStar}
        InactiveIcon={IconHeart}
        size={16}
      />
    ),
  },
  {
    name: 'HorizontalSeparator',
    node: <HorizontalSeparator text="or" />,
  },
  {
    name: 'ResizeHandle',
    node: <ResizeHandle />,
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
