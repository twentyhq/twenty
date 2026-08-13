import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  errorHandler,
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { MOUNT_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { getBuiltStoryComponentPathForRender } from '@/__stories__/utils/getBuiltStoryComponentPathForRender';
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/Worker Platform APIs',
  component: FrontComponentRenderer,
  parameters: {
    layout: 'centered',
  },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;
type Story = StoryObj<typeof FrontComponentRenderer>;

const EXPECTED_OBSERVED_MUTATIONS = [
  {
    type: 'childList',
    addedItems: ['item-0'],
    removedItems: [],
    hasPreviousSibling: false,
    hasNextSibling: false,
  },
  {
    type: 'childList',
    addedItems: ['item-1'],
    removedItems: [],
    hasPreviousSibling: true,
    hasNextSibling: false,
  },
];

const mutationObserverTest: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  const addItemButton = await canvas.findByTestId(
    'mutation-observer-add',
    {},
    { timeout: MOUNT_TIMEOUT },
  );

  await userEvent.click(addItemButton);
  await userEvent.click(addItemButton);

  await waitFor(
    () => {
      expect(
        JSON.parse(
          canvas
            .getByTestId('mutation-observer-status')
            .getAttribute('data-observed-records') ?? '[]',
        ),
      ).toEqual(EXPECTED_OBSERVED_MUTATIONS);
    },
    { timeout: MOUNT_TIMEOUT },
  );

  expect(errorHandler).not.toHaveBeenCalled();
};

const matchMediaTest: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  await canvas.findByTestId(
    'match-media-component',
    {},
    { timeout: MOUNT_TIMEOUT },
  );

  await waitFor(
    () => {
      expect(canvas.getByTestId('match-media-min-width')).toHaveTextContent(
        'min-width matches: true',
      );
      expect(canvas.getByTestId('match-media-unknown-query')).toHaveTextContent(
        'unknown query matches: false',
      );
      expect(
        canvas.getByTestId('match-media-light-color-scheme'),
      ).toHaveTextContent('light color scheme matches: true');
    },
    { timeout: MOUNT_TIMEOUT },
  );

  expect(errorHandler).not.toHaveBeenCalled();
};

const createStory = (
  name: string,
  play: Story['play'],
  runtime?: 'preact',
): Story => ({
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      `${name}.front-component`,
      runtime,
    ),
  },
  play,
});

export const MutationObserverReact: Story = createStory(
  'mutation-observer-example',
  mutationObserverTest,
);
export const MutationObserverPreact: Story = createStory(
  'mutation-observer-example',
  mutationObserverTest,
  'preact',
);
export const MatchMediaReact: Story = createStory(
  'match-media',
  matchMediaTest,
);
export const MatchMediaPreact: Story = createStory(
  'match-media',
  matchMediaTest,
  'preact',
);
