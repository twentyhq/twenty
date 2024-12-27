import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

const companyObjectMetadata = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'company',
);

const personObjectMetadata = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'person',
);

const opportunityObjectMetadata = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'opportunity',
);

export const mockedViewsData = [
  {
    id: '37a8a866-eb17-4e76-9382-03143a2f6a80',
    name: 'All companies',
    objectMetadataId: companyObjectMetadata?.id,
    type: 'table',
    icon: 'IconSkyline',
    key: 'INDEX',
    kanbanFieldMetadataId: null,
    position: 0,
    createdAt: '2021-09-01T00:00:00.000Z',
    updatedAt: '2021-09-01T00:00:00.000Z',
    isCompact: false,
    viewFilterGroups: [],
    viewGroups: [],
    __typename: 'View',
  },
  {
    id: '6095799e-b48f-4e00-b071-10818083593a',
    name: 'All people',
    objectMetadataId: personObjectMetadata?.id,
    type: 'table',
    icon: 'IconPerson',
    key: 'INDEX',
    kanbanFieldMetadataId: null,
    position: 0,
    createdAt: '2021-09-01T00:00:00.000Z',
    updatedAt: '2021-09-01T00:00:00.000Z',
    isCompact: false,
    viewFilterGroups: [],
    viewGroups: [],
    __typename: 'View',
  },
  {
    id: 'e26f66b7-f890-4a5c-b4d2-ec09987b5308',
    name: 'All opportunities',
    objectMetadataId: opportunityObjectMetadata?.id,
    type: 'kanban',
    icon: 'IconOpportunity',
    key: 'INDEX',
    kanbanFieldMetadataId: null,
    position: 0,
    createdAt: '2021-09-01T00:00:00.000Z',
    updatedAt: '2021-09-01T00:00:00.000Z',
    isCompact: false,
    viewFilterGroups: [],
    viewGroups: [],
    __typename: 'View',
  },
  {
    id: '5c307222-1dd5-4ff3-ab06-8d990e9b3c74',
    name: 'All companies (v2)',
    objectMetadataId: companyObjectMetadata?.id,
    type: 'table',
    icon: 'IconSkyline',
    key: null,
    kanbanFieldMetadataId: null,
    position: 0,
    createdAt: '2021-09-01T00:00:00.000Z',
    updatedAt: '2021-09-01T00:00:00.000Z',
    isCompact: false,
    viewFilterGroups: [],
    viewGroups: [],
    __typename: 'View',
  },
];
