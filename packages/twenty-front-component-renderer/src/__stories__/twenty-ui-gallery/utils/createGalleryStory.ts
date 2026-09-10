import { type TwentyUiGalleryStory } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryStory';
import { createGalleryTest } from '@/__stories__/twenty-ui-gallery/utils/createGalleryTest';
import { getBuiltStoryComponentPathForRender } from '@/__stories__/utils/getBuiltStoryComponentPathForRender';

export const createGalleryStory = (
  name: string,
  runtime?: 'preact',
): TwentyUiGalleryStory => ({
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      `${name}.front-component`,
      runtime,
    ),
  },
  play: createGalleryTest(),
});
