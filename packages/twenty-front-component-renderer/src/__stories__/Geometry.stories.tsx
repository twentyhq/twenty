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

export const ObservesSvgShapeSizes: Story = createGeometryStory(
  'svg-resize-observer',
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId(
      'svg-resize-observer-component',
      {},
      { timeout: GEOMETRY_TIMEOUT },
    );

    await waitFor(
      () => {
        expect(
          canvas.getByTestId('svg-resize-observer-svg-size'),
        ).toHaveTextContent('svg: 200x120');
        expect(
          canvas.getByTestId('svg-resize-observer-group-size'),
        ).toHaveTextContent('group: 80x40');
        expect(
          canvas.getByTestId('svg-resize-observer-rect-size'),
        ).toHaveTextContent('rect: 80x40');
      },
      { timeout: GEOMETRY_TIMEOUT },
    );

    expect(
      canvas.getByTestId('svg-resize-observer-rect-notifications'),
    ).toHaveTextContent('rect notifications: 1');

    await userEvent.click(canvas.getByTestId('svg-resize-observer-grow'));

    await waitFor(
      () => {
        expect(
          canvas.getByTestId('svg-resize-observer-group-size'),
        ).toHaveTextContent('group: 120x40');
        expect(
          canvas.getByTestId('svg-resize-observer-rect-size'),
        ).toHaveTextContent('rect: 120x40');
      },
      { timeout: GEOMETRY_TIMEOUT },
    );

    expect(
      canvas.getByTestId('svg-resize-observer-rect-notifications'),
    ).toHaveTextContent('rect notifications: 2');
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
