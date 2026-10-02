import { type StoryObj } from '@storybook/react-vite';

import { type FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';
import { getBuiltStoryComponentPathForRender } from '@/__stories__/utils/getBuiltStoryComponentPathForRender';

type FrontComponentStory = StoryObj<typeof FrontComponentRenderer>;

type RunFrontComponentStoryParams = {
  frontComponentBundleName: string;
  play: NonNullable<FrontComponentStory['play']>;
  runtime?: 'react' | 'preact';
};

export const runFrontComponentStory = ({
  frontComponentBundleName,
  play,
  runtime = 'react',
}: RunFrontComponentStoryParams): FrontComponentStory => ({
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      `${frontComponentBundleName}.front-component`,
      runtime,
    ),
    executionContext: {
      frontComponentId: frontComponentBundleName,
      userId: null,
      recordId: null,
      selectedRecordIds: [],
      timelineActivityId: null,
      colorScheme: 'light',
    },
  },
  play,
});
