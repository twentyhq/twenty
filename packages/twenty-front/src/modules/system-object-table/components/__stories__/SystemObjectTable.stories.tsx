import { type Meta, type StoryObj } from '@storybook/react-vite';
import { Tag } from 'twenty-ui/data-display';
import { ComponentDecorator } from 'twenty-ui/testing';

import { SystemObjectTable } from '@/system-object-table/components/SystemObjectTable';
import { type SystemObjectTableColumn } from '@/system-object-table/types/SystemObjectTableColumn';

type StoryFlow = {
  id: string;
  name: string;
  status: 'ACTIVE' | 'DRAFT' | 'DEACTIVATED';
  updatedAt: Date;
  createdBy: string;
};

const STORY_FLOWS: StoryFlow[] = [
  {
    id: '1',
    name: 'Notify on new deal',
    status: 'ACTIVE',
    updatedAt: new Date('2026-08-11T09:31:00Z'),
    createdBy: 'Tim Apple',
  },
  {
    id: '2',
    name: 'Weekly pipeline digest',
    status: 'DRAFT',
    updatedAt: new Date('2026-08-09T14:02:00Z'),
    createdBy: 'Sylvie Palmer',
  },
  {
    id: '3',
    name: 'Archive stale opportunities',
    status: 'DEACTIVATED',
    updatedAt: new Date('2026-07-28T17:11:00Z'),
    createdBy: 'Tim Apple',
  },
  {
    id: '4',
    name: 'Enrich inbound leads',
    status: 'ACTIVE',
    updatedAt: new Date('2026-08-12T08:45:00Z'),
    createdBy: 'Marie Dubois',
  },
];

const STATUS_TAG_COLOR = {
  ACTIVE: 'green',
  DRAFT: 'yellow',
  DEACTIVATED: 'gray',
} as const;

const STORY_COLUMNS: SystemObjectTableColumn<StoryFlow>[] = [
  {
    key: 'name',
    label: 'Name',
    getSortValue: (flow) => flow.name,
    render: (flow) => flow.name,
  },
  {
    key: 'status',
    label: 'Status',
    width: 140,
    getSortValue: (flow) => flow.status,
    render: (flow) => (
      <Tag color={STATUS_TAG_COLOR[flow.status]} text={flow.status} />
    ),
  },
  {
    key: 'updatedAt',
    label: 'Last update',
    width: 180,
    getSortValue: (flow) => flow.updatedAt,
    render: (flow) => flow.updatedAt.toLocaleDateString('en-US'),
  },
  {
    key: 'createdBy',
    label: 'Created by',
    width: 180,
    getSortValue: (flow) => flow.createdBy,
    render: (flow) => flow.createdBy,
  },
];

const meta: Meta<typeof SystemObjectTable> = {
  title: 'Modules/SystemObjectTable/SystemObjectTable',
  component: SystemObjectTable,
  decorators: [ComponentDecorator],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof SystemObjectTable<StoryFlow>>;

export const Default: Story = {
  args: {
    columns: STORY_COLUMNS,
    items: STORY_FLOWS,
    getItemKey: (flow: StoryFlow) => flow.id,
    defaultSort: { columnKey: 'name', direction: 'asc' },
  },
};

export const Clickable: Story = {
  args: {
    ...Default.args,
    onItemClick: () => {},
  },
};

export const Loading: Story = {
  args: {
    columns: STORY_COLUMNS,
    items: [],
    getItemKey: (flow: StoryFlow) => flow.id,
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    columns: STORY_COLUMNS,
    items: [],
    getItemKey: (flow: StoryFlow) => flow.id,
    emptyState: <div>No workflow yet</div>,
  },
};
