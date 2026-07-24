import { defineFrontComponent } from 'twenty-sdk/define';
import { IconCube } from 'twenty-ui/icon';
import {
  JsonArrayNode,
  JsonNestedNode,
  JsonNode,
  JsonObjectNode,
  JsonTree,
  JsonTreeContextProvider,
  type JsonTreeContextType,
  JsonValueNode,
} from 'twenty-ui/json-visualizer';
import { ThemeProvider } from 'twenty-ui/theme-constants';

import {
  ComponentGallery,
  type GalleryEntry,
} from '../shared/front-components/component-gallery';

const JSON_TREE_CONTEXT_VALUE: JsonTreeContextType = {
  shouldExpandNodeInitially: () => true,
  emptyStringLabel: '[empty string]',
  emptyArrayLabel: '[empty array]',
  emptyObjectLabel: '[empty object]',
  arrowButtonCollapsedLabel: 'Expand',
  arrowButtonExpandedLabel: 'Collapse',
};

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
  {
    name: 'JsonNode',
    node: (
      <JsonTreeContextProvider value={JSON_TREE_CONTEXT_VALUE}>
        <JsonNode value={{ id: 1, name: 'Twenty' }} depth={0} keyPath="" />
      </JsonTreeContextProvider>
    ),
  },
  {
    name: 'JsonArrayNode',
    node: (
      <JsonTreeContextProvider value={JSON_TREE_CONTEXT_VALUE}>
        <JsonArrayNode
          label="items"
          value={[1, 'two', true]}
          depth={0}
          keyPath="items"
          highlighting={undefined}
        />
      </JsonTreeContextProvider>
    ),
  },
  {
    name: 'JsonObjectNode',
    node: (
      <JsonTreeContextProvider value={JSON_TREE_CONTEXT_VALUE}>
        <JsonObjectNode
          label="object"
          value={{ id: 1, name: 'Twenty' }}
          depth={0}
          keyPath="object"
          highlighting={undefined}
        />
      </JsonTreeContextProvider>
    ),
  },
  {
    name: 'JsonNestedNode',
    node: (
      <JsonTreeContextProvider value={JSON_TREE_CONTEXT_VALUE}>
        <JsonNestedNode
          label="nested"
          Icon={IconCube}
          elements={[
            { id: 'id', label: 'id', value: 1 },
            { id: 'name', label: 'name', value: 'Twenty' },
          ]}
          renderElementsCount={(count) => `{${count}}`}
          emptyElementsText="[empty object]"
          depth={0}
          keyPath="nested"
          highlighting={undefined}
        />
      </JsonTreeContextProvider>
    ),
  },
  {
    name: 'JsonValueNode',
    node: (
      <JsonTreeContextProvider value={JSON_TREE_CONTEXT_VALUE}>
        <JsonValueNode valueAsString="Twenty" highlighting={undefined} />
      </JsonTreeContextProvider>
    ),
  },
  {
    name: 'JsonTreeContextProvider',
    node: (
      <JsonTreeContextProvider value={JSON_TREE_CONTEXT_VALUE}>
        <JsonNode value="leaf value" depth={0} keyPath="" />
      </JsonTreeContextProvider>
    ),
  },
];

const JsonVisualizerGallery = () => (
  <ThemeProvider colorScheme="light">
    <ComponentGallery
      title="twenty-ui/json-visualizer"
      entries={JSON_VISUALIZER_ENTRIES}
    />
  </ThemeProvider>
);

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000106',
  name: 'twenty-ui-json-visualizer-gallery',
  description:
    'Renders every twenty-ui/json-visualizer component in the sandbox',
  component: JsonVisualizerGallery,
});
