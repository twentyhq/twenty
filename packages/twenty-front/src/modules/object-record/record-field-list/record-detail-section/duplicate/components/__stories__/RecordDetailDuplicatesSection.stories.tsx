import { type Meta, type StoryObj } from '@storybook/react';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getCompaniesMock } from '~/testing/mock-data/companies';

import { ComponentDecorator } from 'twenty-ui/testing';
import { RecordDetailDuplicatesSection } from '@/object-record/record-field-list/record-detail-section/duplicate/components/RecordDetailDuplicatesSection';

const companiesMock = getCompaniesMock();

const meta: Meta<typeof RecordDetailDuplicatesSection> = {
  title:
    'Modules/ObjectRecord/RecordShow/RecordDetailSection/RecordDetailDuplicatesSection',
  component: RecordDetailDuplicatesSection,
  decorators: [
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    MemoryRouterDecorator,
  ],
  args: {
    objectRecordId: companiesMock[0].id,
    objectNameSingular: CoreObjectNameSingular.Company,
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof RecordDetailDuplicatesSection>;

export const Default: Story = {};
