import { type Meta } from '@storybook/react-vite';

import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { type TwentyUiGalleryStory as Story } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryStory';
import { countrySelectSandboxTest } from '@/__stories__/twenty-ui-gallery/utils/countrySelectSandboxTest';
import { createGalleryStory } from '@/__stories__/twenty-ui-gallery/utils/createGalleryStory';
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/Twenty UI Country Select',
  component: FrontComponentRenderer,
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

export const CountrySelectReactUnsupportedPopup: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-country-select',
  runtime: 'react',
  play: countrySelectSandboxTest,
});

export const CountrySelectPreactUnsupportedPopup: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-country-select',
  runtime: 'preact',
  play: countrySelectSandboxTest,
});
