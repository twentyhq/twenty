import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type GetObjectMetadataFunction } from 'twenty-sdk/front-component';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { FRONT_COMPONENT_HOST_COMMUNICATION_API_NOOP } from '@/host/thread/constants/FrontComponentHostCommunicationApiNoop';
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';
import { getBuiltStoryComponentPathForRender } from '@/__stories__/utils/getBuiltStoryComponentPathForRender';

const errorHandler = fn();

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/Feature',
  component: FrontComponentRenderer,
  parameters: {
    layout: 'centered',
  },
  args: {
    onError: errorHandler,
    applicationAccessToken: 'fake-token',
    executionContext: {
      frontComponentId: 'storybook-test',
      userId: null,
      recordId: null,
      selectedRecordIds: [],
      timelineActivityId: null,
      colorScheme: 'light',
    },
  },
  beforeEach: () => {
    errorHandler.mockClear();
  },
};

export default meta;
type Story = StoryObj<typeof FrontComponentRenderer>;

const createComponentStory = (
  name: string,
  options?: { runtime?: 'preact'; play?: Story['play'] },
): Story => ({
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      `${name}.front-component`,
      options?.runtime,
    ),
  },
  ...(options?.play ? { play: options.play } : {}),
});

export const Static: Story = {
  ...createComponentStory('static'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const container = await canvas.findByTestId(
      'static-component',
      {},
      { timeout: 30000 },
    );
    expect(container).toBeVisible();
    expect(container).toHaveStyle({
      backgroundColor: '#f0f4f8',
      borderRadius: '8px',
    });

    const heading = await canvas.findByText('Static Component');
    expect(heading).toBeVisible();
    expect(heading).toHaveStyle({ fontWeight: '700' });

    const badge = await canvas.findByTestId('styled-badge');
    expect(badge).toBeVisible();
    expect(badge).toHaveStyle({ backgroundColor: '#48bb78' });
  },
};

export const Interactive: Story = {
  ...createComponentStory('interactive'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId('interactive-component', {}, { timeout: 10000 });

    expect(await canvas.findByText('Count: 0')).toBeVisible();

    const button = await canvas.findByTestId('increment-button');
    await userEvent.click(button);
    expect(await canvas.findByText('Count: 1')).toBeVisible();

    await userEvent.click(button);
    expect(await canvas.findByText('Count: 2')).toBeVisible();
  },
};

export const Lifecycle: Story = {
  ...createComponentStory('lifecycle'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId('lifecycle-component', {}, { timeout: 10000 });

    expect(await canvas.findByText('Mounted')).toBeVisible();

    expect(
      await canvas.findByText(/Ticks: [1-9]\d*/, {}, { timeout: 10000 }),
    ).toBeVisible();
  },
};

export const ErrorHandling: Story = {
  ...createComponentStory('nonexistent'),
  play: async () => {
    await waitFor(
      () => {
        expect(errorHandler).toHaveBeenCalled();
      },
      { timeout: 10000 },
    );
  },
};

export const SdkContext: Story = {
  ...createComponentStory('sdk-context-example'),
  args: {
    ...createComponentStory('sdk-context-example').args,
    executionContext: {
      frontComponentId: 'sdk-context-test',
      userId: 'test-user-abc-123',
      recordId: null,
      selectedRecordIds: [],
      timelineActivityId: null,
      colorScheme: 'light',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId('sdk-context-component', {}, { timeout: 30000 });

    const userIdElement = await canvas.findByTestId('sdk-context-user-id');
    expect(userIdElement).toBeVisible();
    expect(userIdElement).toHaveTextContent('test-user-abc-123');

    const jsonElement = await canvas.findByTestId('sdk-context-json');
    expect(jsonElement).toHaveTextContent('"userId": "test-user-abc-123"');

    const button = await canvas.findByTestId('sdk-context-button');
    await userEvent.click(button);

    const renderCount = await canvas.findByTestId('sdk-context-render-count');
    expect(renderCount).toHaveTextContent('Renders: 1');

    expect(userIdElement).toHaveTextContent('test-user-abc-123');
  },
};

export const CachedObjectMetadata: Story = {
  ...createComponentStory('sdk-context-example'),
  render: function Render(args) {
    const [stageLabel, setStageLabel] = useState<string | null>('Closed won');
    const getObjectMetadata: GetObjectMetadataFunction = async (
      objectNameSingular,
    ) => {
      if (objectNameSingular !== 'opportunity' || !isDefined(stageLabel)) {
        return null;
      }

      return {
        id: 'opportunity-id',
        nameSingular: 'opportunity',
        namePlural: 'opportunities',
        labelSingular: 'Opportunity',
        labelPlural: 'Opportunities',
        fields: [
          {
            id: 'stage-id',
            name: 'stage',
            label: 'Sales stage',
            type: 'SELECT',
            options: [
              { value: 'WON', label: stageLabel, position: 0, color: 'green' },
            ],
          },
        ],
      };
    };

    return (
      <>
        <button onClick={() => setStageLabel('Deal won')}>Rename stage</button>
        <button onClick={() => setStageLabel(null)}>Disconnect metadata</button>
        <FrontComponentRenderer
          componentUrl={args.componentUrl}
          executionContext={args.executionContext}
          colorScheme={args.colorScheme}
          onError={args.onError}
          frontComponentHostCommunicationApi={{
            ...FRONT_COMPONENT_HOST_COMMUNICATION_API_NOOP,
            getObjectMetadata: isDefined(stageLabel)
              ? getObjectMetadata
              : undefined,
          }}
        />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const load = await canvas.findByRole(
      'button',
      { name: 'Load stage options' },
      { timeout: 30000 },
    );
    await userEvent.click(load);
    expect(await canvas.findByText('Closed won')).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Rename stage' }));
    await userEvent.click(load);
    expect(await canvas.findByText('Deal won')).toBeVisible();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Disconnect metadata' }),
    );
    await userEvent.click(load);
    expect(await canvas.findByText('No metadata available')).toBeVisible();
  },
};
