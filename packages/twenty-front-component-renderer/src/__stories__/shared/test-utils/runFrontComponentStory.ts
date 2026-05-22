import { type StoryObj } from '@storybook/react-vite';

import { type FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';
import { getBuiltStoryComponentPathForRender } from '../../utils/getBuiltStoryComponentPathForRender';

type FrontComponentStory = StoryObj<typeof FrontComponentRenderer>;

type RunFrontComponentStoryParams = {
  frontComponentBundleName: string;
  scenarioId: string;
  play: NonNullable<FrontComponentStory['play']>;
};

export const runFrontComponentStory = ({
  frontComponentBundleName,
  scenarioId,
  play,
}: RunFrontComponentStoryParams): FrontComponentStory => ({
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      `${frontComponentBundleName}.front-component`,
    ),
    executionContext: {
      frontComponentId: scenarioId,
      userId: null,
      recordId: null,
      selectedRecordIds: [],
    },
  },
  play,
});
