import { type Meta } from '@storybook/react-vite';

import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { type TwentyUiGalleryStory } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryStory';
import { autocompleteCompositionTest } from '@/__stories__/twenty-ui-gallery/utils/autocompleteCompositionTest';
import { autocompleteDismissalTest } from '@/__stories__/twenty-ui-gallery/utils/autocompleteDismissalTest';
import { autocompleteEmptyTest } from '@/__stories__/twenty-ui-gallery/utils/autocompleteEmptyTest';
import { autocompleteInputTest } from '@/__stories__/twenty-ui-gallery/utils/autocompleteInputTest';
import { autocompletePartsTest } from '@/__stories__/twenty-ui-gallery/utils/autocompletePartsTest';
import { createGalleryStory } from '@/__stories__/twenty-ui-gallery/utils/createGalleryStory';
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/Twenty UI Autocomplete',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

export const InputReact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-autocomplete',
  runtime: 'react',
  play: autocompleteInputTest,
});

export const InputPreact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-autocomplete',
  runtime: 'preact',
  play: autocompleteInputTest,
});

export const CompositionReact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-autocomplete',
  runtime: 'react',
  play: autocompleteCompositionTest,
});

export const CompositionPreact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-autocomplete',
  runtime: 'preact',
  play: autocompleteCompositionTest,
});

export const EmptyReact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-autocomplete',
  runtime: 'react',
  play: autocompleteEmptyTest,
});

export const EmptyPreact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-autocomplete',
  runtime: 'preact',
  play: autocompleteEmptyTest,
});

export const PartsReact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-autocomplete-parts',
  runtime: 'react',
  play: autocompletePartsTest,
});

export const PartsPreact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-autocomplete-parts',
  runtime: 'preact',
  play: autocompletePartsTest,
});

export const DismissalReact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-autocomplete-parts',
  runtime: 'react',
  play: autocompleteDismissalTest,
});

export const DismissalPreact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-autocomplete-parts',
  runtime: 'preact',
  play: autocompleteDismissalTest,
});
