import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';

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
      () => {
        expect(canvas.getByTestId('geometry-measure-width')).toHaveTextContent(
          'width: 240',
        );
        expect(canvas.getByTestId('geometry-measure-height')).toHaveTextContent(
          'height: 80',
        );
        expect(
          canvas.getByTestId('geometry-measure-offset-width'),
        ).toHaveTextContent('offsetWidth: 240');
        expect(
          canvas.getByTestId('geometry-measure-inner-width'),
        ).not.toHaveTextContent('innerWidth: 0');
      },
      { timeout: GEOMETRY_TIMEOUT },
    );

    expect(errorHandler).not.toHaveBeenCalled();
  },
);

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
