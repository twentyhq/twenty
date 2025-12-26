import { VIEW_FIELD_FRAGMENT } from '@/views/graphql/fragments/viewFieldFragment';
import { VIEW_FILTER_FRAGMENT } from '@/views/graphql/fragments/viewFilterFragment';
import { VIEW_FILTER_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewFilterGroupFragment';
import { VIEW_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewGroupFragment';
import { VIEW_SORT_FRAGMENT } from '@/views/graphql/fragments/viewSortFragment';
import { gql } from '@apollo/client';

export const VIEW_FRAGMENT = gql`
  ${VIEW_FIELD_FRAGMENT}
  ${VIEW_FILTER_FRAGMENT}
  ${VIEW_FILTER_GROUP_FRAGMENT}
  ${VIEW_SORT_FRAGMENT}
  ${VIEW_GROUP_FRAGMENT}

  fragment ViewFragment on CoreView {
    id
    name
    objectMetadataId
    type
    key
    icon
    position
    isCompact
    openRecordIn
    kanbanAggregateOperation
    kanbanAggregateOperationFieldMetadataId
    mainGroupByFieldMetadataId
    shouldHideEmptyGroups
    anyFieldFilterValue
    calendarFieldMetadataId
    calendarLayout
    visibility
    createdByUserWorkspaceId
    viewFields {
      ...ViewFieldFragment
    }
    viewFilters {
      ...ViewFilterFragment
    }
    viewFilterGroups {
      ...ViewFilterGroupFragment
    }
    viewSorts {
      ...ViewSortFragment
    }
    viewGroups {
      ...ViewGroupFragment
    }
  }
`;
