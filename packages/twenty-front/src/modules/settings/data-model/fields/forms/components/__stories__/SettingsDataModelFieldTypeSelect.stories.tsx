import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { FieldMetadataType } from '~/generated-metadata/graphql';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsDataModelFieldTypeSelect } from '../SettingsDataModelFieldTypeSelect';

const meta: Meta<typeof SettingsDataModelFieldTypeSelect> = {
  title:
    'Modules/Settings/DataModel/Fields/Forms/SettingsDataModelFieldTypeSelect',
  component: SettingsDataModelFieldTypeSelect,
  decorators: [ComponentDecorator],
  args: {
    onChange: fn(),
    value: FieldMetadataType.Text,
  },
  parameters: {
    container: { width: 512 },
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsDataModelFieldTypeSelect>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithOpenSelect: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const inputField = await canvas.findByText('Text');

    await userEvent.click(inputField);

    const input = await canvas.findByText('Unique ID');
    await userEvent.click(input);

    await userEvent.click(inputField);
  },
};

export const WithExcludedFieldTypes: Story = {
  args: {
    excludedFieldTypes: [FieldMetadataType.Uuid, FieldMetadataType.Numeric],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const inputField = await canvas.findByText('Text');

    await userEvent.click(inputField);

    await canvas.findByText('Number');

    expect(canvas.queryByText('Unique ID')).toBeNull();
    expect(canvas.queryByText('Numeric')).toBeNull();
  },
};
