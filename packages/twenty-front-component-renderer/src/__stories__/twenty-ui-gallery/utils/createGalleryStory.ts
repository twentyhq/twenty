import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { type TwentyUiGalleryStory } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryStory';
import { getBuiltStoryComponentPathForRender } from '@/__stories__/utils/getBuiltStoryComponentPathForRender';

type CreateGalleryStoryOptions = {
  frontComponentBundleName: string;
  runtime: 'react' | 'preact';
  play: TwentyUiGalleryPlayFunction;
};

export const createGalleryStory = ({
  frontComponentBundleName,
  runtime,
  play,
}: CreateGalleryStoryOptions): TwentyUiGalleryStory => ({
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      `${frontComponentBundleName}.front-component`,
      runtime,
    ),
  },
  play,
});
