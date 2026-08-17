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

const EXPECTED_CLASS_LIST_REPORT = {
  isMemoized: true,
  containsMapboxClass: true,
  containsRemovedClass: false,
  length: 4,
  tokens: ['initial-class', 'mapboxgl-map', 'replaced', 'toggled-on'],
  value: 'initial-class mapboxgl-map replaced toggled-on',
};

const classListTest: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  const runButton = await canvas.findByTestId(
    'class-list-run',
    {},
    { timeout: MOUNT_TIMEOUT },
  );

  await userEvent.click(runButton);

  await waitFor(
    () => {
      expect(
        JSON.parse(
          canvas
            .getByTestId('class-list-status')
            .getAttribute('data-class-list-report') ?? 'null',
        ),
      ).toEqual(EXPECTED_CLASS_LIST_REPORT);
    },
    { timeout: MOUNT_TIMEOUT },
  );

  await waitFor(
    () => {
      expect(canvas.getByTestId('class-list-container').className).toBe(
        EXPECTED_CLASS_LIST_REPORT.value,
      );
    },
    { timeout: MOUNT_TIMEOUT },
  );

  expect(errorHandler).not.toHaveBeenCalled();
};

const createStory = ({
  name,
  play,
  runtime,
}: {
  name: string;
  play: Story['play'];
  runtime?: 'preact';
}): Story => ({
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      `${name}.front-component`,
      runtime,
    ),
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
export const ClassListReact: Story = createStory({
  name: 'class-list-example',
  play: classListTest,
});
export const ClassListPreact: Story = createStory({
  name: 'class-list-example',
  play: classListTest,
  runtime: 'preact',
});
