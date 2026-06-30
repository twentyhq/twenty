import { type StoryObj } from '@storybook/react-vite';

import { type FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';
import { getBuiltStoryComponentPathForRender } from '@/__stories__/utils/getBuiltStoryComponentPathForRender';

type FrontComponentStory = StoryObj<typeof FrontComponentRenderer>;

type RunFrontComponentStoryParams = {
  frontComponentBundleName: string;
  play: NonNullable<FrontComponentStory['play']>;
};

export const runFrontComponentStory = ({
  frontComponentBundleName,
  play,
}: RunFrontComponentStoryParams): FrontComponentStory => ({
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      `${frontComponentBundleName}.front-component`,
    ),
    executionContext: {
      frontComponentId: frontComponentBundleName,
      userId: null,
      recordId: null,
      selectedRecordIds: [],
      colorScheme: 'light',
    },
  },
  play,
});
