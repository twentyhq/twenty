import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { FieldMetadataType } from '~/generated-metadata/graphql';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { SettingsObjectFieldTypeSelectSection } from '../SettingsObjectFieldTypeSelectSection';

const meta: Meta<typeof SettingsObjectFieldTypeSelectSection> = {
  title: 'Modules/Settings/DataModel/SettingsObjectFieldTypeSelectSection',
  component: SettingsObjectFieldTypeSelectSection,
  decorators: [ComponentDecorator],
  args: {
    fieldType: FieldMetadataType.Number,
    fieldIconKey: 'IconUsers',
    fieldLabel: 'Employees',
    fieldName: 'employees',
    isObjectCustom: false,
    objectIconKey: 'IconUser',
    objectLabelPlural: 'People',
    objectNamePlural: 'people',
  },
};

export default meta;
type Story = StoryObj<typeof SettingsObjectFieldTypeSelectSection>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithOpenSelect: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const selectLabel = canvas.getByText('Number');

    await userEvent.click(selectLabel);
  },
};
