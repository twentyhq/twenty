import { type Meta, type StoryObj } from '@storybook/react-vite';

import { RecordDetailDuplicatesSection } from '@/object-record/record-field-list/record-detail-section/duplicate/components/RecordDetailDuplicatesSection';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
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
        }}
      >
        <Story />
      </LayoutRenderingProvider>
    ),
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
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
