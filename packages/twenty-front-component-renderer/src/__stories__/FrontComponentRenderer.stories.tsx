import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';
import checksumFixtures from '@/__stories__/example-sources-built/checksum-fixtures.json';
import { getBuiltStoryComponentPathForRender } from '@/__stories__/utils/getBuiltStoryComponentPathForRender';
import { getFingerprintedStoryComponentUrl } from '@/__stories__/utils/getFingerprintedStoryComponentUrl';

const errorHandler = fn();

const CHECKSUM_MISMATCH_MESSAGE_PATTERN = /checksum mismatch/;

type ChecksumRecoveryHarnessProps = Pick<
  ComponentProps<typeof FrontComponentRenderer>,
  | 'onError'
  | 'applicationAccessToken'
  | 'executionContext'
  | 'frontComponentHostCommunicationApi'
  | 'colorScheme'
>;

const ChecksumRecoveryHarness = ({
  onError,
  applicationAccessToken,
  executionContext,
  frontComponentHostCommunicationApi,
  colorScheme,
}: ChecksumRecoveryHarnessProps) => {
  const [componentUrl, setComponentUrl] = useState(
    getFingerprintedStoryComponentUrl(checksumFixtures.staleChecksum),
  );

  return (
    <>
      <button
        type="button"
        data-testid="load-matching-build"
        onClick={() =>
          setComponentUrl(
            getFingerprintedStoryComponentUrl(
              checksumFixtures.matchingChecksum,
            ),
          )
        }
      >
        Load matching build
      </button>
      <FrontComponentRenderer
        componentUrl={componentUrl}
        onError={onError}
        applicationAccessToken={applicationAccessToken}
        executionContext={executionContext}
        frontComponentHostCommunicationApi={frontComponentHostCommunicationApi}
        colorScheme={colorScheme}
      />
    </>
  );
};

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

export const ChecksumMismatch: Story = {
  args: {
    componentUrl: getFingerprintedStoryComponentUrl(
      checksumFixtures.staleChecksum,
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        CHECKSUM_MISMATCH_MESSAGE_PATTERN,
        {},
        { timeout: 10000 },
      ),
    ).toBeVisible();

    await waitFor(() => {
      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'FRONT_COMPONENT_SOURCE_CHECKSUM_MISMATCH',
        }),
      );
    });

    expect(canvas.queryByTestId('static-component')).not.toBeInTheDocument();
  },
};

export const ChecksumRecovery: Story = {
  args: {
    componentUrl: getFingerprintedStoryComponentUrl(
      checksumFixtures.staleChecksum,
    ),
  },
  render: ({
    onError,
    applicationAccessToken,
    executionContext,
    frontComponentHostCommunicationApi,
    colorScheme,
  }) => (
    <ChecksumRecoveryHarness
      onError={onError}
      applicationAccessToken={applicationAccessToken}
      executionContext={executionContext}
      frontComponentHostCommunicationApi={frontComponentHostCommunicationApi}
      colorScheme={colorScheme}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(
      CHECKSUM_MISMATCH_MESSAGE_PATTERN,
      {},
      { timeout: 10000 },
    );

    await userEvent.click(await canvas.findByTestId('load-matching-build'));

    expect(
      await canvas.findByTestId('static-component', {}, { timeout: 30000 }),
    ).toBeVisible();
    expect(
      canvas.queryByText(CHECKSUM_MISMATCH_MESSAGE_PATTERN),
    ).not.toBeInTheDocument();
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
