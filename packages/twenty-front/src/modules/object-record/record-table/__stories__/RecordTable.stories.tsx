import { Meta, StoryObj } from '@storybook/react';

import { RecordTableWithWrappers } from '@/object-record/record-table/components/RecordTableWithWrappers';
import { RecordTableEmptyStateNoGroupNoRecordAtAll } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateNoGroupNoRecordAtAll';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RecordTableDecorator } from '~/testing/decorators/RecordTableDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedViewsData } from '~/testing/mock-data/views';

const meta: Meta = {
  title: 'Modules/ObjectRecord/RecordTable/RecordTable',
  component: RecordTableWithWrappers,
  decorators: [
    ComponentDecorator,
    MemoryRouterDecorator,
    RecordTableDecorator,
    ContextStoreDecorator,
    SnackBarDecorator,
    ObjectMetadataItemsDecorator,
    I18nFrontDecorator,
  ],
  args: {
    recordTableId: `companies-${mockedViewsData[0].id}`,
    viewBarId: 'view-bar',
    objectNameSingular: 'company',
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof RecordTableEmptyStateNoGroupNoRecordAtAll>;

export const Default: Story = {};
