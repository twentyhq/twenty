import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { useEffect } from 'react';
import { expect, within } from 'storybook/test';

import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { isMinimalMetadataReadyState } from '@/metadata-store/states/isMinimalMetadataReadyState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedPersonRecords } from '~/testing/mock-data/generated/data/people/mock-people-data';
import { mockedWorkspaceMemberData } from '~/testing/mock-data/users';
import { generateMockRecordConnection } from '~/testing/utils/generateMockRecordConnection';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

import { RecordShowPage } from '~/pages/object-record/RecordShowPage';

const flatPersonRecords = mockedPersonRecords.map((record) =>
  getRecordFromRecordNode({ recordNode: record }),
);

const personRecord = flatPersonRecords[0];

const PAGE_LAYOUT_ID = 'person-record-layout';
const PAGE_LAYOUT_TAB_ID = 'person-record-tab';

const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');

const personPageLayout = {
  __typename: 'PageLayout' as const,
  id: PAGE_LAYOUT_ID,
  name: 'Person',
  type: PageLayoutType.RECORD_PAGE,
  isFirstTabPinned: true,
  objectMetadataId: personObjectMetadataItem.id,
  isSystemSideEffect: false,
  applicationId: '',
  universalIdentifier: PAGE_LAYOUT_ID,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  deletedAt: null,
};

const personPageLayoutTab = {
  __typename: 'PageLayoutTab' as const,
  id: PAGE_LAYOUT_TAB_ID,
  pageLayoutId: PAGE_LAYOUT_ID,
  title: 'Home',
  position: 0,
  isActive: true,
  isSystemSideEffect: false,
  layoutMode: PageLayoutTabLayoutMode.GRID,
  applicationId: '',
  universalIdentifier: PAGE_LAYOUT_TAB_ID,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  deletedAt: null,
};

const personFieldsWidget = {
  __typename: 'PageLayoutWidget' as const,
  id: 'person-fields-widget',
  pageLayoutTabId: PAGE_LAYOUT_TAB_ID,
  type: WidgetType.FIELDS,
  title: 'Fields',
  objectMetadataId: personObjectMetadataItem.id,
  isActive: true,
  isSystemSideEffect: false,
  applicationId: '',
  universalIdentifier: 'person-fields-widget',
  gridPosition: {
    __typename: 'GridPosition' as const,
    row: 0,
    column: 0,
    rowSpan: 12,
    columnSpan: 12,
  },
  configuration: {
    __typename: 'FieldsConfiguration' as const,
    configurationType: WidgetConfigurationType.FIELDS,
  },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  deletedAt: null,
};

// The minimal metadata mocks ship no page layouts, so this seeds one holding the fields widget.
const SeedPersonPageLayoutEffect = () => {
  const { replaceDraft, applyChanges } = useUpdateMetadataStoreDraft();
  const isMinimalMetadataReady = useAtomStateValue(isMinimalMetadataReadyState);

  useEffect(() => {
    if (!isMinimalMetadataReady) {
      return;
    }

    replaceDraft('pageLayouts', [personPageLayout], 'mocked');
    replaceDraft('pageLayoutTabs', [personPageLayoutTab], 'mocked');
    replaceDraft('pageLayoutWidgets', [personFieldsWidget], 'mocked');
    applyChanges();
  }, [isMinimalMetadataReady, replaceDraft, applyChanges]);

  return null;
};

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/ObjectRecord/RecordShowPage',
  component: RecordShowPage,
  decorators: [
    (Story) => (
      <>
        <SeedPersonPageLayoutEffect />
        <Story />
      </>
    ),
    PageDecorator,
  ],
  args: {
    routePath: '/object/:objectNameSingular/:objectRecordId',
    routeParams: {
      ':objectNameSingular': 'person',
      ':objectRecordId': personRecord.id,
    },
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindManyPeople', () => {
          return HttpResponse.json({
            data: {
              people: generateMockRecordConnection({
                objectNameSingular: 'person',
                records: flatPersonRecords,
              }),
            },
          });
        }),
        graphql.query('FindOnePerson', () => {
          return HttpResponse.json({
            data: {
              person: mockedPersonRecords[0],
            },
          });
        }),
        graphql.query('FindOneworkspaceMember', () => {
          return HttpResponse.json({
            data: {
              workspaceMember: mockedWorkspaceMemberData,
            },
          });
        }),
        graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

export type Story = StoryObj<typeof RecordShowPage>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('jeffery.griffin@example.com', undefined, {
        timeout: 5000,
      }),
    ).toBeInTheDocument();
    expect(
      await canvas.findByText('Embryologist, clinical'),
    ).toBeInTheDocument();
  },
};
