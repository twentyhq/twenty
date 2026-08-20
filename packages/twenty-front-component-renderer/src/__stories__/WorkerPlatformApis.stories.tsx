import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  errorHandler,
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  FRONT_COMPONENT_STORY_DEFAULT_EXECUTION_CONTEXT,
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

const createMatchMediaTest =
  (expectedColorScheme: 'light' | 'dark'): Story['play'] =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId(
      'match-media-component',
      {},
      { timeout: MOUNT_TIMEOUT },
    );

    await waitFor(
      () => {
        expect(
          canvas.getByTestId('match-media-color-scheme'),
        ).toHaveTextContent(`color scheme: ${expectedColorScheme}`);
      },
      { timeout: MOUNT_TIMEOUT },
    );

    expect(canvas.getByTestId('match-media-own-width')).toHaveTextContent(
      'own width matches: true',
    );
    expect(
      canvas.getByTestId('match-media-wider-than-own-width'),
    ).toHaveTextContent('wider than own width matches: false');
    expect(canvas.getByTestId('match-media-unknown-query')).toHaveTextContent(
      'unknown query matches: false',
    );
    expect(
      canvas.getByTestId('match-media-empty-query-in-list'),
    ).toHaveTextContent('empty query in list matches: false');
    expect(canvas.getByTestId('match-media-orientation')).toHaveTextContent(
      'orientation matches: true',
    );

    expect(errorHandler).not.toHaveBeenCalled();
  };

type CreateStoryInput = {
  name: string;
  play: Story['play'];
  runtime?: 'preact';
  args?: Partial<Story['args']>;
};

const createStory = ({
  name,
  play,
  runtime,
  args,
}: CreateStoryInput): Story => ({
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      `${name}.front-component`,
      runtime,
    ),
    ...args,
  },
  play,
});

export const MutationObserverReact: Story = createStory({
  name: 'mutation-observer-example',
  play: mutationObserverTest,
});
export const MutationObserverPreact: Story = createStory({
  name: 'mutation-observer-example',
  play: mutationObserverTest,
  runtime: 'preact',
});
export const MatchMediaReact: Story = createStory({
  name: 'match-media',
  play: createMatchMediaTest('light'),
});
export const MatchMediaPreact: Story = createStory({
  name: 'match-media',
  play: createMatchMediaTest('light'),
  runtime: 'preact',
});
export const MatchMediaDarkColorScheme: Story = createStory({
  name: 'match-media',
  play: createMatchMediaTest('dark'),
  args: {
    colorScheme: 'dark',
    executionContext: {
      ...FRONT_COMPONENT_STORY_DEFAULT_EXECUTION_CONTEXT,
      colorScheme: 'dark',
    },
  },
});
