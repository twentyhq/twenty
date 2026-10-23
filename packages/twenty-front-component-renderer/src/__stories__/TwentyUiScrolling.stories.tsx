import { type Meta } from '@storybook/react-vite';

import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { type TwentyUiGalleryStory } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryStory';
import { ScrollBoundaryDecorator } from '@/__stories__/twenty-ui-gallery/components/ScrollBoundaryDecorator';
import { autocompleteFilterResetTest } from '@/__stories__/twenty-ui-gallery/utils/autocompleteFilterResetTest';
import { autocompleteNestedRevealTest } from '@/__stories__/twenty-ui-gallery/utils/autocompleteNestedRevealTest';
import { autocompleteRevealTest } from '@/__stories__/twenty-ui-gallery/utils/autocompleteRevealTest';
import { createAutocompleteLongInputTest } from '@/__stories__/twenty-ui-gallery/utils/createAutocompleteLongInputTest';
import { createGalleryStory } from '@/__stories__/twenty-ui-gallery/utils/createGalleryStory';
import { selectAlignedOpenTest } from '@/__stories__/twenty-ui-gallery/utils/selectAlignedOpenTest';
import { selectRevealTest } from '@/__stories__/twenty-ui-gallery/utils/selectRevealTest';
import { tabsOverflowTest } from '@/__stories__/twenty-ui-gallery/utils/tabsOverflowTest';
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/Twenty UI Scrolling',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

export const AutocompleteRevealReact: TwentyUiGalleryStory = createGalleryStory(
  {
    frontComponentBundleName: 'twenty-ui-autocomplete-scrolling',
    runtime: 'react',
    play: autocompleteRevealTest,
  },
);

export const AutocompleteRevealPreact: TwentyUiGalleryStory =
  createGalleryStory({
    frontComponentBundleName: 'twenty-ui-autocomplete-scrolling',
    runtime: 'preact',
    play: autocompleteRevealTest,
  });

export const AutocompleteNestedRevealReact: TwentyUiGalleryStory =
  createGalleryStory({
    frontComponentBundleName: 'twenty-ui-autocomplete-scrolling',
    runtime: 'react',
    play: autocompleteNestedRevealTest,
    decorators: [ScrollBoundaryDecorator],
  });

export const AutocompleteNestedRevealPreact: TwentyUiGalleryStory =
  createGalleryStory({
    frontComponentBundleName: 'twenty-ui-autocomplete-scrolling',
    runtime: 'preact',
    play: autocompleteNestedRevealTest,
    decorators: [ScrollBoundaryDecorator],
  });

export const AutocompleteFilterResetReact: TwentyUiGalleryStory =
  createGalleryStory({
    frontComponentBundleName: 'twenty-ui-autocomplete-scrolling',
    runtime: 'react',
    play: autocompleteFilterResetTest,
  });

export const AutocompleteFilterResetPreact: TwentyUiGalleryStory =
  createGalleryStory({
    frontComponentBundleName: 'twenty-ui-autocomplete-scrolling',
    runtime: 'preact',
    play: autocompleteFilterResetTest,
  });

export const AutocompleteLongInputReact: TwentyUiGalleryStory =
  createGalleryStory({
    frontComponentBundleName: 'twenty-ui-autocomplete-scrolling',
    runtime: 'react',
    play: createAutocompleteLongInputTest({ isTrusted: false }),
  });

export const AutocompleteLongInputPreact: TwentyUiGalleryStory =
  createGalleryStory({
    frontComponentBundleName: 'twenty-ui-autocomplete-scrolling',
    runtime: 'preact',
    play: createAutocompleteLongInputTest({ isTrusted: false }),
  });

export const AutocompleteTrustedLongInputReact: TwentyUiGalleryStory = {
  ...createGalleryStory({
    frontComponentBundleName: 'twenty-ui-autocomplete-scrolling',
    runtime: 'react',
    play: createAutocompleteLongInputTest({ isTrusted: true }),
  }),
  tags: ['!dev'],
};

export const AutocompleteTrustedLongInputPreact: TwentyUiGalleryStory = {
  ...createGalleryStory({
    frontComponentBundleName: 'twenty-ui-autocomplete-scrolling',
    runtime: 'preact',
    play: createAutocompleteLongInputTest({ isTrusted: true }),
  }),
  tags: ['!dev'],
};

export const SelectRevealReact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-select-scrolling',
  runtime: 'react',
  play: selectRevealTest,
});

export const SelectRevealPreact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-select-scrolling',
  runtime: 'preact',
  play: selectRevealTest,
});

export const SelectAlignedOpenReact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-select-scrolling',
  runtime: 'react',
  play: selectAlignedOpenTest,
});

export const SelectAlignedOpenPreact: TwentyUiGalleryStory = createGalleryStory(
  {
    frontComponentBundleName: 'twenty-ui-select-scrolling',
    runtime: 'preact',
    play: selectAlignedOpenTest,
  },
);

export const TabsOverflowReact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-tabs-scrolling',
  runtime: 'react',
  play: tabsOverflowTest,
});

export const TabsOverflowPreact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-tabs-scrolling',
  runtime: 'preact',
  play: tabsOverflowTest,
});
