import { defineFrontComponent } from 'twenty-sdk/define';
import { JsonTree } from 'twenty-ui/components';
import { ThemeProvider } from 'twenty-ui/theme';

import {
  ComponentGallery,
  type GalleryEntry,
} from '../shared/front-components/component-gallery';

const JSON_VISUALIZER_ENTRIES: GalleryEntry[] = [
  {
    name: 'JsonTree',
    node: (
      <JsonTree
        value={{ id: 1, name: 'Twenty', tags: ['a', 'b'], active: true }}
        shouldExpandNodeInitially={() => true}
        emptyArrayLabel="[empty array]"
        emptyObjectLabel="[empty object]"
        emptyStringLabel="[empty string]"
        arrowButtonCollapsedLabel="Expand"
        arrowButtonExpandedLabel="Collapse"
      />
    ),
  },
];

const JsonVisualizerGallery = () => (
  <ThemeProvider colorScheme="light">
    <ComponentGallery
      title="twenty-ui/components: JsonTree"
      entries={JSON_VISUALIZER_ENTRIES}
    />
  </ThemeProvider>
);

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000106',
  name: 'twenty-ui-json-visualizer-gallery',
  description: 'Renders JsonTree in the sandbox',
  component: JsonVisualizerGallery,
});
