import { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { ComponentDecorator } from 'twenty-ui';

import { FieldMetadataType } from '~/generated-metadata/graphql';
import { FormProviderDecorator } from '~/testing/decorators/FormProviderDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsDataModelFieldTypeSelect } from '../SettingsDataModelFieldTypeSelect';

const meta: Meta<typeof SettingsDataModelFieldTypeSelect> = {
  title:
    'Modules/Settings/DataModel/Fields/Forms/SettingsDataModelFieldTypeSelect',
  component: SettingsDataModelFieldTypeSelect,
  decorators: [FormProviderDecorator, ComponentDecorator],
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
  play: async () => {
    const canvas = within(document.body);

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
  play: async () => {
    const canvas = within(document.body);

    const inputField = await canvas.findByText('Text');

    await userEvent.click(inputField);

    await canvas.findByText('Number');

    expect(canvas.queryByText('Unique ID')).toBeNull();
    expect(canvas.queryByText('Numeric')).toBeNull();
  },
};
