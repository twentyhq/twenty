import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { getBuiltStoryComponentPathForRender } from '@/__stories__/utils/getBuiltStoryComponentPathForRender';
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

const GEOMETRY_TIMEOUT = 30000;

const errorHandler = fn();

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/Geometry',
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
      colorScheme: 'light',
    },
  },
  beforeEach: () => {
    errorHandler.mockClear();
  },
};

export default meta;
type Story = StoryObj<typeof FrontComponentRenderer>;

const createGeometryStory = (name: string, play: Story['play']): Story => ({
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      `${name}.front-component`,
    ),
  },
  play,
});

export const MirrorsElementGeometryIntoTheWorker: Story = createGeometryStory(
  'geometry-measure',
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId(
      'geometry-measure-component',
      {},
      { timeout: GEOMETRY_TIMEOUT },
    );

    await waitFor(
      async () => {
        expect(
          await canvas.findByTestId('geometry-measure-width'),
        ).toHaveTextContent('width: 240');
      },
      { timeout: GEOMETRY_TIMEOUT },
    );

    await waitFor(
      async () => {
        expect(
          await canvas.findByTestId('geometry-measure-height'),
        ).toHaveTextContent('height: 80');
      },
      { timeout: GEOMETRY_TIMEOUT },
    );

    await waitFor(
      async () => {
        expect(
          await canvas.findByTestId('geometry-measure-offset-width'),
        ).toHaveTextContent('offsetWidth: 240');
      },
      { timeout: GEOMETRY_TIMEOUT },
    );

    await waitFor(
      async () => {
        expect(
          await canvas.findByTestId('geometry-measure-inner-width'),
        ).not.toHaveTextContent('innerWidth: 0');
      },
      { timeout: GEOMETRY_TIMEOUT },
    );

    expect(errorHandler).not.toHaveBeenCalled();
  },
);

export const DoesNotBreakAComponentThatNeverMeasures: Story =
  createGeometryStory('geometry-no-measure', async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId(
      'geometry-no-measure-component',
      {},
      { timeout: GEOMETRY_TIMEOUT },
    );

    expect(errorHandler).not.toHaveBeenCalled();
  });

export const CapsObservedElementsAndDoesNotGrowAcrossRemounts: Story =
  createGeometryStory('geometry-observation-cap', async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId(
      'geometry-observation-cap-component',
      {},
      { timeout: GEOMETRY_TIMEOUT },
    );

    await waitFor(
      async () => {
        expect(
          await canvas.findByTestId('geometry-observation-cap-count'),
        ).toHaveTextContent('measured: 500');
      },
      { timeout: GEOMETRY_TIMEOUT },
    );

    await userEvent.click(
      await canvas.findByTestId('geometry-observation-cap-remount'),
    );

    await waitFor(
      async () => {
        expect(
          await canvas.findByTestId('geometry-observation-cap-count'),
        ).toHaveTextContent('measured: 500');
      },
      { timeout: GEOMETRY_TIMEOUT },
    );

    expect(errorHandler).not.toHaveBeenCalled();
  });

// Hovering does not open the recharts tooltip in the sandbox yet, so this
// story only verifies the chart itself renders from mirrored geometry.
export const RendersRechartsAreaChart: Story = createGeometryStory(
  'recharts-example',
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId(
      'recharts-component',
      {},
      { timeout: GEOMETRY_TIMEOUT },
    );

    expect(await canvas.findByText('Jan')).toBeVisible();
    expect(await canvas.findByText('Jun')).toBeVisible();

    expect(errorHandler).not.toHaveBeenCalled();
  },
);
