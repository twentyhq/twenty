import { type Meta, type StoryObj } from '@storybook/react-vite';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { RecordDetailDuplicatesSection } from '@/object-record/record-field-list/record-detail-section/duplicate/components/RecordDetailDuplicatesSection';
import { ComponentDecorator } from 'twenty-ui/testing';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { mockedCompanyRecords } from '~/testing/mock-data/generated/data/companies/mock-companies-data';

const meta: Meta<typeof RecordDetailDuplicatesSection> = {
  title:
    'Modules/ObjectRecord/RecordShow/RecordDetailSection/RecordDetailDuplicatesSection',
  component: RecordDetailDuplicatesSection,
  decorators: [
    (Story) => (
      <LayoutRenderingProvider
        value={{
          targetRecordIdentifier: {
            id: mockedCompanyRecords[0].id,
            targetObjectNameSingular: 'company',
          },
          layoutType: PageLayoutType.RECORD_PAGE,
          isInRightDrawer: false,
        }}
      >
        <Story />
      </LayoutRenderingProvider>
    ),
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    MemoryRouterDecorator,
  ],
  args: {
    objectRecordId: mockedCompanyRecords[0].id,
    objectNameSingular: CoreObjectNameSingular.Company,
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof RecordDetailDuplicatesSection>;

export const Default: Story = {};
