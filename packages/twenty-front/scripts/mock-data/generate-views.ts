/* eslint-disable no-console, lingui/no-unlocalized-strings */
import { graphqlRequest, writeGeneratedFile } from './utils.js';

const FIND_ALL_CORE_VIEWS_QUERY = `
  query FindAllCoreViews {
    getCoreViews {
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
        id
        fieldMetadataId
        viewId
        isVisible
        position
        size
        aggregateOperation
        createdAt
        updatedAt
        deletedAt
      }
      viewFieldGroups {
        id
        name
        position
        isVisible
        viewId
        createdAt
        updatedAt
        deletedAt
        viewFields {
          id
          fieldMetadataId
          viewId
          isVisible
          position
          size
          aggregateOperation
          createdAt
          updatedAt
          deletedAt
        }
      }
      viewFilters {
        id
        fieldMetadataId
        operand
        value
        viewFilterGroupId
        positionInViewFilterGroup
        subFieldName
        viewId
        createdAt
        updatedAt
        deletedAt
      }
      viewFilterGroups {
        id
        parentViewFilterGroupId
        logicalOperator
        positionInViewFilterGroup
        viewId
      }
      viewSorts {
        id
        fieldMetadataId
        direction
        viewId
      }
      viewGroups {
        id
        isVisible
        fieldValue
        position
        viewId
        createdAt
        updatedAt
        deletedAt
      }
    }
  }
`;

export const generateViews = async (token: string) => {
  console.log('Fetching views from /metadata ...');

  const data = (await graphqlRequest(
    '/metadata',
    FIND_ALL_CORE_VIEWS_QUERY,
    token,
  )) as {
    getCoreViews: Record<string, unknown>[];
  };

  console.log(`  Got ${data.getCoreViews.length} views.`);

  writeGeneratedFile(
    'metadata/views/mock-views-data.ts',
    'mockedCoreViews',
    'CoreViewWithRelations[]',
    "import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';",
    data.getCoreViews,
  );
};
