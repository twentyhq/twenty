import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { ViewType } from '@/views/types/ViewType';
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

export const mockedViewsData: View[] = [
  {
    id: '37a8a866-eb17-4e76-9382-03143a2f6a80',
    name: 'All companies',
    objectMetadataId: companyObjectMetadata?.id,
    type: ViewType.Table,
    icon: 'IconSkyline',
    key: ViewKey.Index,
    kanbanFieldMetadataId: '',
    kanbanAggregateOperation: AGGREGATE_OPERATIONS.count,
    kanbanAggregateOperationFieldMetadataId: '',
    position: 0,
    isCompact: false,
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    viewFilterGroups: [],
    viewGroups: [],
    viewFields: [],
    viewFilters: [],
    viewSorts: [],
    __typename: 'View',
  },
  {
    id: '6095799e-b48f-4e00-b071-10818083593a',
    name: 'All people',
    objectMetadataId: personObjectMetadata?.id,
    type: ViewType.Table,
    icon: 'IconPerson',
    key: ViewKey.Index,
    kanbanFieldMetadataId: '',
    kanbanAggregateOperation: AGGREGATE_OPERATIONS.count,
    kanbanAggregateOperationFieldMetadataId: '',
    position: 0,
    isCompact: false,
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    viewFilterGroups: [],
    viewGroups: [],
    viewFields: [],
    viewFilters: [],
    viewSorts: [],
    __typename: 'View',
  },
  {
    id: 'e26f66b7-f890-4a5c-b4d2-ec09987b5308',
    name: 'All opportunities',
    objectMetadataId: opportunityObjectMetadata?.id,
    type: ViewType.Kanban,
    icon: 'IconOpportunity',
    key: ViewKey.Index,
    kanbanFieldMetadataId: '',
    kanbanAggregateOperation: AGGREGATE_OPERATIONS.count,
    kanbanAggregateOperationFieldMetadataId: '',
    position: 0,
    isCompact: false,
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    viewFilterGroups: [],
    viewGroups: [],
    viewFields: [],
    viewFilters: [],
    viewSorts: [],
    __typename: 'View',
  },
  {
    id: '5c307222-1dd5-4ff3-ab06-8d990e9b3c74',
    name: 'All companies (v2)',
    objectMetadataId: companyObjectMetadata?.id,
    type: ViewType.Table,
    icon: 'IconSkyline',
    key: null,
    kanbanFieldMetadataId: '',
    kanbanAggregateOperation: AGGREGATE_OPERATIONS.count,
    kanbanAggregateOperationFieldMetadataId: '',
    position: 0,
    isCompact: false,
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    viewFilterGroups: [],
    viewGroups: [],
    viewFields: [],
    viewFilters: [],
    viewSorts: [],
    __typename: 'View',
  },
];
