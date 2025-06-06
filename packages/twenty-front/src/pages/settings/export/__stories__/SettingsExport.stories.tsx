import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';

// eslint-disable-next-line prettier/prettier
import { PageDecorator, PageDecoratorArgs, } from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/utils/sleep';

import { SettingsExport } from '../SettingsExport';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/SettingsExport',
  component: SettingsExport,
  decorators: [PageDecorator],
  args: { routePath: '/settings/workspace-export' },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsExport>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await sleep(1000);

    const title = await canvas.findByText('Select Objects to Export');
    expect(title).toBeInTheDocument();

    const searchInput = await canvas.findByPlaceholderText(
      'Search for an object...',
    );
    expect(searchInput).toBeInTheDocument();

    const continueButton = await canvas.findByText(/Continue \(0 selected\)/);
    expect(continueButton).toBeInTheDocument();
    expect(continueButton).toBeDisabled();

    const selectHeader = await canvas.findByText('Select');
    expect(selectHeader).toBeInTheDocument();

    const nameHeader = await canvas.findByText('Name');
    expect(nameHeader).toBeInTheDocument();

    const typeHeader = await canvas.findByText('Type');
    expect(typeHeader).toBeInTheDocument();

    const fieldsHeader = await canvas.findByText('Fields');
    expect(fieldsHeader).toBeInTheDocument();

    const recordsHeader = await canvas.findByText('Records');
    expect(recordsHeader).toBeInTheDocument();
  },
};

export const WithSearch: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await sleep(1000);

    const searchInput = await canvas.findByPlaceholderText(
      'Search for an object...',
    );
    await userEvent.type(searchInput, 'people');

    await sleep(500);

    expect(searchInput).toHaveValue('people');
  },
};

export const WithObjectSelection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await sleep(1000);

    const checkboxes = await canvas.findAllByRole('checkbox');
    if (checkboxes.length > 1) {
      const firstObjectCheckbox = checkboxes[1];
      await userEvent.click(firstObjectCheckbox);

      await sleep(300);

      const continueButton = await canvas.findByText(/Continue \(1 selected\)/);
      expect(continueButton).toBeInTheDocument();
      expect(continueButton).not.toBeDisabled();
    }
  },
};

export const FormatSelectionStep: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await sleep(1000);

    const checkboxes = await canvas.findAllByRole('checkbox');
    if (checkboxes.length > 1) {
      const firstObjectCheckbox = checkboxes[1];
      await userEvent.click(firstObjectCheckbox);
    }

    await sleep(300);

    const continueButton = await canvas.findByText(/Continue \(1 selected\)/);
    await userEvent.click(continueButton);

    await sleep(500);

    const formatTitle = await canvas.findByText('Select Export Format');
    expect(formatTitle).toBeInTheDocument();

    const csvOption = await canvas.findByText('CSV');
    expect(csvOption).toBeInTheDocument();

    const jsonOption = await canvas.findByText('JSON');
    expect(jsonOption).toBeInTheDocument();
  },
};

export const TypePreservationStep: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await sleep(1000);

    const checkboxes = await canvas.findAllByRole('checkbox');
    if (checkboxes.length > 1) {
      const firstObjectCheckbox = checkboxes[1];
      await userEvent.click(firstObjectCheckbox);
    }

    await sleep(300);

    const continueButton = await canvas.findByText(/Continue \(1 selected\)/);
    await userEvent.click(continueButton);

    await sleep(500);

    const jsonOption = await canvas.findByText('JSON');
    await userEvent.click(jsonOption);

    await sleep(300);

    const nextButton = await canvas.findByText('Next');
    await userEvent.click(nextButton);

    await sleep(500);

    const typeTitle = await canvas.findByText('Preserve Type Information');
    expect(typeTitle).toBeInTheDocument();

    const preserveToggle = await canvas.findByRole('switch');
    expect(preserveToggle).toBeInTheDocument();
  },
};

export const EmptyState: Story = {
  parameters: {
    msw: {
      handlers: [
        ...graphqlMocks.handlers.filter(
          (handler) =>
            !(
              'operationName' in handler.info &&
              (handler.info as { operationName: string }).operationName ===
                'FindManyObjectMetadataItems'
            ),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await sleep(1000);

    const title = await canvas.findByText('Select Objects to Export');
    expect(title).toBeInTheDocument();

    const continueButton = await canvas.findByText(/Continue \(0 selected\)/);
    expect(continueButton).toBeDisabled();
  },
};
