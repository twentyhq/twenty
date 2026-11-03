import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
  AUTO_SELECT_MODEL_ID_BY_TIER,
  AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
} from 'twenty-shared/ai';
import { CatalogDecorator } from 'twenty-ui/testing';

import { AiModelPickerExample } from '@/ai/components/__stories__/AiModelPickerExample';

const meta = {
  title: 'Modules/AI/AiModelPicker',
  component: AiModelPickerExample,
  decorators: [CatalogDecorator],
  parameters: {
    catalog: { options: { elementContainer: { width: 400 } } },
  },
  args: {
    onModelIdChange: fn(),
    onConfigurationChange: fn(),
  },
} satisfies Meta<typeof AiModelPickerExample>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SelectModelAndEffort: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', {
        name: 'Workspace default · Balanced',
      }),
    );
    await userEvent.click(
      await body.findByRole('option', { name: /^Reasoning One/ }),
    );
    await expect(args.onModelIdChange).toHaveBeenCalledTimes(1);
    await expect(args.onModelIdChange).toHaveBeenLastCalledWith(
      'story/reasoning-one',
    );

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Default' }),
    );
    await userEvent.click(await body.findByRole('option', { name: 'High' }));
    await expect(args.onModelIdChange).toHaveBeenCalledTimes(2);
    await expect(args.onModelIdChange).toHaveBeenLastCalledWith(
      'story/reasoning-one@high',
    );

    await userEvent.click(
      canvas.getByRole('button', { name: /^Reasoning One/ }),
    );
    await userEvent.click(
      await body.findByRole('option', { name: /^Reasoning Two/ }),
    );
    await expect(args.onModelIdChange).toHaveBeenCalledTimes(3);
    await expect(args.onModelIdChange).toHaveBeenLastCalledWith(
      'story/reasoning-two@high',
    );
    await expect(canvas.getByRole('button', { name: 'High' })).toBeVisible();

    await userEvent.click(
      canvas.getByRole('button', { name: /^Reasoning Two/ }),
    );
    await userEvent.click(
      await body.findByRole('option', { name: /^Fast Model/ }),
    );
    await expect(args.onModelIdChange).toHaveBeenCalledTimes(4);
    await expect(args.onModelIdChange).toHaveBeenLastCalledWith('story/fast');
    await expect(
      canvas.queryByRole('button', { name: 'High' }),
    ).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: /^Fast Model/ }));
    await userEvent.click(
      await body.findByRole('option', { name: /^Balanced/ }),
    );
    await expect(args.onModelIdChange).toHaveBeenCalledTimes(5);
    await expect(args.onModelIdChange).toHaveBeenLastCalledWith(
      AUTO_SELECT_MODEL_ID_BY_TIER.balanced,
    );

    await userEvent.click(canvas.getByRole('button', { name: /^Balanced/ }));
    await userEvent.click(
      await body.findByRole('option', {
        name: 'Workspace default · Balanced',
      }),
    );
    await expect(args.onModelIdChange).toHaveBeenCalledTimes(6);
    await expect(args.onModelIdChange).toHaveBeenLastCalledWith(
      AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
    );
  },
};

export const MissingPinnedModel: Story = {
  args: { initialModelId: 'story/retired' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', {
        name: 'story/retired (unavailable)',
      }),
    );
    const unavailableModel = await body.findByRole('option', {
      name: 'story/retired (unavailable)',
    });

    await expect(unavailableModel).toBeDisabled();
    await userEvent.click(unavailableModel);
    await expect(args.onModelIdChange).not.toHaveBeenCalled();

    await userEvent.click(
      body.getByRole('option', { name: 'Workspace default · Balanced' }),
    );
    await expect(args.onModelIdChange).toHaveBeenCalledTimes(1);
    await expect(args.onModelIdChange).toHaveBeenCalledWith(
      AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
    );
  },
};

export const CapabilitiesForReasoningVariant: Story = {
  args: {
    initialModelId: 'story/reasoning-one@high',
    initialModelConfiguration: {
      webSearch: { enabled: false, configuration: { maximumResults: 3 } },
      twitterSearch: { enabled: true, configuration: { language: 'en' } },
    },
    shouldShowCapabilities: true,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const webSearch = await canvas.findByRole('switch', { name: 'Web Search' });

    await expect(webSearch).not.toBeChecked();
    await expect(
      canvas.queryByRole('switch', { name: 'Twitter/X Search' }),
    ).not.toBeInTheDocument();
    await userEvent.click(webSearch);
    await expect(webSearch).toBeChecked();
    await expect(args.onConfigurationChange).toHaveBeenCalledTimes(1);
    await expect(args.onConfigurationChange).toHaveBeenCalledWith({
      webSearch: { enabled: true, configuration: { maximumResults: 3 } },
      twitterSearch: { enabled: true, configuration: { language: 'en' } },
    });
  },
};

export const Disabled: Story = {
  args: {
    initialModelId: 'story/reasoning-one@high',
    shouldShowCapabilities: true,
    disabled: true,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const webSearch = await canvas.findByRole('switch', { name: 'Web Search' });

    await expect(canvas.getByText('Reasoning One · OpenAI')).toBeVisible();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    await expect(webSearch).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(canvas.getByText('Web Search'));
    await expect(webSearch).not.toBeChecked();
    await expect(body.queryByRole('option')).not.toBeInTheDocument();
    await expect(args.onModelIdChange).not.toHaveBeenCalled();
    await expect(args.onConfigurationChange).not.toHaveBeenCalled();
  },
};
