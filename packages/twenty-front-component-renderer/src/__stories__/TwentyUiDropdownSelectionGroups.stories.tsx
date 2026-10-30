import { type Meta } from '@storybook/react-vite';

import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { type TwentyUiGalleryStory as Story } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryStory';
import { createGalleryStory } from '@/__stories__/twenty-ui-gallery/utils/createGalleryStory';
import { dropdownSelectionGroupsTest } from '@/__stories__/twenty-ui-gallery/utils/dropdownSelectionGroupsTest';
import { dropdownSelectionEventsTest } from '@/__stories__/twenty-ui-gallery/utils/dropdownSelectionEventsTest';
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/Twenty UI Dropdown Selection Groups',
  component: FrontComponentRenderer,
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

export const SelectionGroupsReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-dropdown',
  runtime: 'react',
  play: dropdownSelectionGroupsTest,
});

export const SelectionGroupsPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-dropdown',
  runtime: 'preact',
  play: dropdownSelectionGroupsTest,
});

export const SelectionEventsReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-dropdown',
  runtime: 'react',
  play: dropdownSelectionEventsTest,
});

export const SelectionEventsPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-dropdown',
  runtime: 'preact',
  play: dropdownSelectionEventsTest,
});
