import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import type { Meta, StoryObj } from '@storybook/react';
import { FieldMetadataType } from '~/generated/graphql';
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
};

export const WithDefaultValues: Story = {
  args: {
    ...Default.args,
    defaultFields: ['name', 'domainName'],
  },
};

export const ReadOnly: Story = {
  args: {
    ...Default.args,
    readonly: true,
    defaultFields: ['name', 'domainName'],
  },
};
