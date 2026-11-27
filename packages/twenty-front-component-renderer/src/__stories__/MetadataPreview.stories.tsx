import { createElement } from 'react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { getBuiltStoryComponentPathForRender } from '@/__stories__/utils/getBuiltStoryComponentPathForRender';
import { MOUNT_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { FrontComponentSourceRenderer } from '@/host/components/FrontComponentSourceRenderer';

const queryMetadata = fn();
const onError = fn();
const selection = {
  object: {
    __args: { id: 'opportunity' },
    fields: {
      __args: { filter: {}, paging: { first: 100 } },
      edges: { node: { name: true, options: true } },
    },
  },
};
const meta: Meta<typeof FrontComponentSourceRenderer> = {
  title: 'FrontComponent/Metadata Preview',
  component: FrontComponentSourceRenderer,
  args: {
    componentId: 'metadata-preview',
    componentSource: '',
    mockQueryResult: {},
    queryMetadata,
    colorScheme: 'light',
    onError,
  },
  loaders: [
    async () => ({
      componentSource: await fetch(
        getBuiltStoryComponentPathForRender('metadata-preview.front-component'),
      ).then((response) => response.text()),
    }),
  ],
  render: (args, { loaded }) =>
    createElement(FrontComponentSourceRenderer, {
      ...args,
      componentSource: loaded.componentSource,
    }),
  beforeEach: () => {
    onError.mockReset();
    queryMetadata.mockReset();
    queryMetadata.mockResolvedValue({
      object: {
        fields: {
          edges: [
            {
              node: {
                options: [
                  { label: 'Proposal', color: 'purple', position: 1 },
                  { label: 'Qualification', color: 'blue', position: 0 },
                ],
              },
            },
          ],
        },
      },
    });
  },
};

export default meta;
type Story = StoryObj<typeof FrontComponentSourceRenderer>;

export const ReadsWorkspaceMetadata: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(
      await canvas.findByText(
        'Qualification (blue), Proposal (purple)',
        {},
        {
          timeout: MOUNT_TIMEOUT,
        },
      ),
    ).toBeVisible();
    expect(queryMetadata).toHaveBeenCalledWith(selection);

    queryMetadata.mockResolvedValueOnce({
      object: {
        fields: {
          edges: [
            {
              node: {
                options: [{ label: 'Discovery', color: 'green', position: 0 }],
              },
            },
          ],
        },
      },
    });
    await userEvent.click(
      canvas.getByRole('button', { name: 'Reload stages' }),
    );
    expect(await canvas.findByText('Discovery (green)')).toBeVisible();

    queryMetadata.mockRejectedValueOnce(new Error('Permission denied'));
    await userEvent.click(
      canvas.getByRole('button', { name: 'Reload stages' }),
    );
    expect(await canvas.findByText('Permission denied')).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Try mutation' }));
    expect(
      await canvas.findByText('Mutations are unavailable in previews.'),
    ).toBeVisible();
    expect(queryMetadata).toHaveBeenCalledTimes(3);
    expect(onError).not.toHaveBeenCalled();
  },
};
