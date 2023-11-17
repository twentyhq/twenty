import { MemoryRouter } from 'react-router-dom';
import { Meta, StoryObj } from '@storybook/react';

import { FieldMetadataType } from '~/generated-metadata/graphql';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { SettingsObjectFieldPreview } from '../SettingsObjectFieldPreview';

const meta: Meta<typeof SettingsObjectFieldPreview> = {
  title: 'Modules/Settings/DataModel/SettingsObjectFieldPreview',
  component: SettingsObjectFieldPreview,
  decorators: [ComponentDecorator],
  args: {
    fieldIconKey: 'IconNotes',
    fieldLabel: 'Description',
    fieldType: FieldMetadataType.Text,
    isObjectCustom: false,
    objectIconKey: 'IconBuildingSkyscraper',
    objectLabelPlural: 'Companies',
    objectNamePlural: 'companies',
  },
};

export default meta;
type Story = StoryObj<typeof SettingsObjectFieldPreview>;

export const Text: Story = {};

export const Boolean: Story = {
  args: {
    fieldIconKey: 'IconHeadphones',
    fieldLabel: 'Priority Support',
    fieldType: FieldMetadataType.Boolean,
  },
};

export const Currency: Story = {
  args: {
    fieldIconKey: 'IconCurrencyDollar',
    fieldLabel: 'Amount',
    fieldType: FieldMetadataType.Currency,
  },
};

export const Date: Story = {
  args: {
    fieldIconKey: 'IconCalendarEvent',
    fieldLabel: 'Registration Date',
    fieldType: FieldMetadataType.Date,
  },
};

export const Link: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: {
    fieldIconKey: 'IconWorldWww',
    fieldLabel: 'Website',
    fieldType: FieldMetadataType.Link,
  },
};

export const Number: Story = {
  args: {
    fieldIconKey: 'IconUsers',
    fieldLabel: 'Employees',
    fieldType: FieldMetadataType.Number,
  },
};

export const Select: Story = {
  args: {
    fieldIconKey: 'IconBuildingFactory2',
    fieldLabel: 'Industry',
    fieldType: FieldMetadataType.Enum,
  },
};

export const CustomObject: Story = {
  args: {
    isObjectCustom: true,
    objectIconKey: 'IconApps',
    objectLabelPlural: 'Workspaces',
    objectNamePlural: 'workspaces',
  },
};
