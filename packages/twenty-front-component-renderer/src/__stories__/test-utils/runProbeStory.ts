import { type StoryObj } from '@storybook/react-vite';

import { type FrontComponentRenderer } from '../../host/components/FrontComponentRenderer';
import { getBuiltStoryComponentPathForRender } from '../utils/getBuiltStoryComponentPathForRender';

type ProbeStory = StoryObj<typeof FrontComponentRenderer>;

type ProbeName =
  | 'form-controls'
  | 'pointer-keyboard'
  | 'caret'
  | 'host-api'
  | 'baseline'
  | 'property-reflection';

type RunProbeStoryParams = {
  probe: ProbeName;
  scenarioId: string;
  play: NonNullable<ProbeStory['play']>;
};

export const runProbeStory = ({
  probe,
  scenarioId,
  play,
}: RunProbeStoryParams): ProbeStory => ({
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      `${probe}.probe.front-component`,
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
