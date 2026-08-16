import { type AxiosInstance } from "axios";
import { postGraphql } from "src/logic-functions/data/targetWorkspace/graphql-client.util";
import { View } from "src/logic-functions/types/view-entities.type";

const QUERY = `query findViews {
  getViews {
    id
    name
    objectMetadataId
    type
    key
    icon
    position
    isCompact
    kanbanAggregateOperation
    kanbanAggregateOperationFieldMetadataId
    mainGroupByFieldMetadataId
    shouldHideEmptyGroups
    kanbanColumnWidth
    calendarFieldMetadataId
    calendarEndFieldMetadataId
    anyFieldFilterValue
    calendarLayout
    viewFields {
      id
      fieldMetadataId
      isVisible
      size
      position
      aggregateOperation
      viewId
      viewFieldGroupId
    }
    viewFilters {
      id
      fieldMetadataId
      operand
      value
      viewFilterGroupId
      positionInViewFilterGroup
      subFieldName
      relationTargetFieldMetadataId
      viewId
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
      subFieldName
      viewId
    }
    viewGroups {
      id
      isVisible
      fieldValue
      position
      viewId
    }
    viewFieldGroups {
      id
      name
      position
      isVisible
      viewId
    }
  }
}`;

export const findViews = async (client: AxiosInstance): Promise<View[]> => {
  const data = await postGraphql<{ getViews: View[] }>(
    client,
    '/metadata',
    'findViews',
    QUERY,
  );

  return data.getViews;
}
