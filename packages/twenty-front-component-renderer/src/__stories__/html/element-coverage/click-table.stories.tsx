import { type Meta } from '@storybook/react-vite';

import { FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';
import { createHtmlElementClickStory } from '../../shared/test-utils/createHtmlElementStory';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '../../shared/test-utils/createFrontComponentStoryMeta';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HTML/ElementCoverage/Click/Table',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

export const Table = createHtmlElementClickStory('table');
export const Thead = createHtmlElementClickStory('thead');
export const Tbody = createHtmlElementClickStory('tbody');
export const Tfoot = createHtmlElementClickStory('tfoot');
export const Tr = createHtmlElementClickStory('tr');
export const Th = createHtmlElementClickStory('th');
export const Td = createHtmlElementClickStory('td');
export const Caption = createHtmlElementClickStory('caption');
export const Colgroup = createHtmlElementClickStory('colgroup');
