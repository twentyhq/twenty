import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { WorkflowFieldsMultiSelect } from '@/workflow/components/WorkflowEditUpdateEventFieldsMultiSelect';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const meta: Meta<typeof WorkflowFieldsMultiSelect> = {
  title: 'Modules/Workflow/WorkflowFieldsMultiSelect',
  component: WorkflowFieldsMultiSelect,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof WorkflowFieldsMultiSelect>;

const fields = [
  {
    id: '1',
    universalIdentifier: '1',
    name: 'name',
    label: 'Name',
    type: FieldMetadataType.TEXT,
    description: 'Company name',
    isActive: true,
    isSystem: false,
    isUIEditable: true,
    isNullable: false,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: '2',
    universalIdentifier: '2',
    name: 'domainName',
    label: 'Domain Name',
    type: FieldMetadataType.TEXT,
    description: 'Company domain name',
    isActive: true,
    isSystem: false,
    isUIEditable: true,
    isNullable: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: '3',
    universalIdentifier: '3',
    name: 'employees',
    label: 'Employees',
    type: FieldMetadataType.NUMBER,
    description: 'Number of employees',
    isActive: true,
    isSystem: false,
    isUIEditable: true,
    isNullable: true,
    createdAt: '',
    updatedAt: '',
  },
];

const mockObjectMetadataItem: EnrichedObjectMetadataItem = {
  id: '1',
  universalIdentifier: '1',
  nameSingular: 'company',
  namePlural: 'companies',
  labelSingular: 'Company',
  labelPlural: 'Companies',
  description: 'A company',
  icon: 'IconBuilding',
  isSystem: false,
  isUIEditable: true,
  isUICreatable: true,
  isActive: true,
  createdAt: '',
  updatedAt: '',
  isLabelSyncedWithName: true,
  isRemote: false,
  isSearchable: true,
  labelIdentifierFieldMetadataId: '1',
  indexMetadatas: [],
  searchFieldMetadatas: [],
  fields: fields,
  readableFields: fields,
  updatableFields: fields,
};

export const Default: Story = {
  args: {
    label: 'Fields to update',
    placeholder: 'Select fields to update',
    objectMetadataItem: mockObjectMetadataItem,
    handleFieldsChange: () => {},
    readonly: false,
    defaultFields: [],
    actionType: 'UPDATE_RECORD',
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
    actionType: 'UPDATE_RECORD',
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
    actionType: 'UPDATE_RECORD',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('Name')).toBeVisible();
    expect(await canvas.findByText('Domain Name')).toBeVisible();
  },
};
