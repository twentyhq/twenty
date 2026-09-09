import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  errorHandler,
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  FRONT_COMPONENT_STORY_DEFAULT_EXECUTION_CONTEXT,
  hostApiMocks,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectJsonDataAttribute } from '@/__stories__/shared/test-utils/matchers/expectJsonDataAttribute';
import {
  INTERACTION_TIMEOUT,
  MOUNT_TIMEOUT,
} from '@/__stories__/shared/test-utils/timeouts';
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

  await expectJsonDataAttribute({
    canvas,
    testId: 'mutation-observer-status',
    attributeName: 'data-observed-records',
    expectedValue: EXPECTED_OBSERVED_MUTATIONS,
  });

  expect(errorHandler).not.toHaveBeenCalled();
};

const EXPECTED_CLASS_LIST_REPORT = {
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

  await expectJsonDataAttribute({
    canvas,
    testId: 'class-list-status',
    attributeName: 'data-class-list-report',
    expectedValue: EXPECTED_CLASS_LIST_REPORT,
  });

  await waitFor(
    () => {
      expect(canvas.getByTestId('class-list-container').className).toBe(
        EXPECTED_CLASS_LIST_REPORT.value,
      );
    },
    { timeout: INTERACTION_TIMEOUT },
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
        expect(
          canvas.getByTestId('match-media-own-width-value'),
        ).not.toHaveTextContent('own width: 0');
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

    const container = canvas.getByTestId('match-media-container');

    for (const { width, height } of [
      { width: 700, height: 300 },
      { width: 700, height: 900 },
      { width: 400, height: 600 },
    ]) {
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;

      await waitFor(
        () => {
          expect(
            canvas.getByTestId('match-media-own-width-value'),
          ).toHaveTextContent(`own width: ${width}`);
          expect(
            canvas.getByTestId('match-media-own-height-value'),
          ).toHaveTextContent(`own height: ${height}`);
          expect(canvas.getByTestId('match-media-own-width')).toHaveTextContent(
            'own width matches: true',
          );
          expect(
            canvas.getByTestId('match-media-wider-than-own-width'),
          ).toHaveTextContent('wider than own width matches: false');
          expect(
            canvas.getByTestId('match-media-orientation'),
          ).toHaveTextContent('orientation matches: true');
        },
        { timeout: INTERACTION_TIMEOUT },
      );
    }

    expect(errorHandler).not.toHaveBeenCalled();
  };

const MATCH_MEDIA_DECORATORS: Story['decorators'] = [
  (Story) => (
    <div
      data-testid="match-media-container"
      style={{ width: 400, height: 600 }}
    >
      <Story />
    </div>
  ),
];

type CreateStoryInput = {
  name: string;
  play: Story['play'];
  decorators?: Story['decorators'];
  runtime?: 'preact';
  args?: Partial<Story['args']>;
};

const createStory = ({
  name,
  play,
  decorators,
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
  decorators,
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
export const MatchMediaReact: Story = createStory({
  name: 'match-media',
  play: createMatchMediaTest('light'),
  decorators: MATCH_MEDIA_DECORATORS,
});
export const MatchMediaPreact: Story = createStory({
  name: 'match-media',
  play: createMatchMediaTest('light'),
  decorators: MATCH_MEDIA_DECORATORS,
  runtime: 'preact',
});
export const MatchMediaDarkColorScheme: Story = createStory({
  name: 'match-media',
  play: createMatchMediaTest('dark'),
  decorators: MATCH_MEDIA_DECORATORS,
  args: {
    colorScheme: 'dark',
    executionContext: {
      ...FRONT_COMPONENT_STORY_DEFAULT_EXECUTION_CONTEXT,
      colorScheme: 'dark',
    },
  },
});

const MatchMediaColorSchemeToggle = () => {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  return (
    <>
      <button
        type="button"
        data-testid="match-media-toggle-color-scheme"
        onClick={() =>
          setColorScheme((currentColorScheme) =>
            currentColorScheme === 'light' ? 'dark' : 'light',
          )
        }
      >
        Toggle color scheme
      </button>
      <FrontComponentRenderer
        componentUrl={getBuiltStoryComponentPathForRender(
          'match-media.front-component',
        )}
        applicationAccessToken={
          FRONT_COMPONENT_STORY_DEFAULT_ARGS.applicationAccessToken
        }
        executionContext={{
          ...FRONT_COMPONENT_STORY_DEFAULT_EXECUTION_CONTEXT,
          colorScheme,
        }}
        frontComponentHostCommunicationApi={hostApiMocks}
        onError={errorHandler}
        colorScheme={colorScheme}
      />
    </>
  );
};

export const MatchMediaColorSchemeChange: Story = {
  render: () => <MatchMediaColorSchemeToggle />,
  play: async ({ canvasElement }) => {
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
        ).toHaveTextContent('color scheme: light');
      },
      { timeout: MOUNT_TIMEOUT },
    );
    expect(
      canvas.getByTestId('match-media-color-scheme-change-count'),
    ).toHaveTextContent('color scheme changes: 0');

    await userEvent.click(
      canvas.getByTestId('match-media-toggle-color-scheme'),
    );

    await waitFor(
      () => {
        expect(
          canvas.getByTestId('match-media-color-scheme'),
        ).toHaveTextContent('color scheme: dark');
        expect(
          canvas.getByTestId('match-media-color-scheme-change-count'),
        ).toHaveTextContent('color scheme changes: 1');
      },
      { timeout: MOUNT_TIMEOUT },
    );

    expect(errorHandler).not.toHaveBeenCalled();
  },
};
