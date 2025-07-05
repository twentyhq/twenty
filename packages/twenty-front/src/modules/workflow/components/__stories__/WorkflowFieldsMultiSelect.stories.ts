import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { expect } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { WorkflowFieldsMultiSelect } from '../WorkflowEditUpdateEventFieldsMultiSelect';

const meta: Meta<typeof WorkflowFieldsMultiSelect> = {
  title: 'Modules/Workflow/WorkflowFieldsMultiSelect',
  component: WorkflowFieldsMultiSelect,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof WorkflowFieldsMultiSelect>;

const mockObjectMetadataItem: ObjectMetadataItem = {
  id: '1',
  nameSingular: 'company',
  namePlural: 'companies',
  labelSingular: 'Company',
  labelPlural: 'Companies',
  description: 'A company',
  icon: 'IconBuilding',
  isSystem: false,
  isCustom: false,
  isActive: true,
  createdAt: '',
  updatedAt: '',
  isLabelSyncedWithName: true,
  isRemote: false,
  isSearchable: true,
  labelIdentifierFieldMetadataId: '1',
  indexMetadatas: [],
  fields: [
    {
      id: '1',
      name: 'name',
      label: 'Name',
      type: FieldMetadataType.TEXT,
      description: 'Company name',
      isCustom: false,
      isActive: true,
      isSystem: false,
      isNullable: false,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: '2',
      name: 'domainName',
      label: 'Domain Name',
      type: FieldMetadataType.TEXT,
      description: 'Company domain name',
      isCustom: false,
      isActive: true,
      isSystem: false,
      isNullable: true,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: '3',
      name: 'employees',
      label: 'Employees',
      type: FieldMetadataType.NUMBER,
      description: 'Number of employees',
      isCustom: false,
      isActive: true,
      isSystem: false,
      isNullable: true,
      createdAt: '',
      updatedAt: '',
    },
  ],
};

export const Default: Story = {
  args: {
    label: 'Fields to update',
    placeholder: 'Select fields to update',
    objectMetadataItem: mockObjectMetadataItem,
    handleFieldsChange: () => {},
    readonly: false,
    defaultFields: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(
      await canvas.findByTestId('workflow-fields-multi-select'),
    ).toBeVisible();
  },
};

export const WithDefaultValues: Story = {
  args: {
    ...Default.args,
    defaultFields: ['name', 'domainName'],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('Name')).toBeVisible();
    expect(await canvas.findByText('Domain Name')).toBeVisible();
  },
};

export const ReadOnly: Story = {
  args: {
    ...Default.args,
    readonly: true,
    defaultFields: ['name', 'domainName'],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('Name')).toBeVisible();
    expect(await canvas.findByText('Domain Name')).toBeVisible();
  },
};
