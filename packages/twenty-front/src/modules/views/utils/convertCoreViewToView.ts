import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { type View } from '@/views/types/View';
import { convertCoreViewFieldToViewField } from '@/views/utils/convertCoreViewFieldToViewField';
import { convertCoreViewFilterGroupToViewFilterGroup } from '@/views/utils/convertCoreViewFilterGroupToViewFilterGroup';
import { convertCoreViewFilterToViewFilter } from '@/views/utils/convertCoreViewFilterToViewFilter';
import { convertCoreViewGroupToViewGroup } from '@/views/utils/convertCoreViewGroupToViewGroup';
import { convertCoreViewKeyToViewKey } from '@/views/utils/convertCoreViewKeyToViewKey';
import { convertCoreViewOpenRecordInToViewOpenRecordIn } from '@/views/utils/convertCoreViewOpenRecordInToViewOpenRecordIn';
import { convertCoreViewTypeToViewType } from '@/views/utils/convertCoreViewTypeToViewType';
import { ViewVisibility } from '~/generated-metadata/graphql';

export const convertCoreViewToView = (
  coreView: CoreViewWithRelations,
): View => {
  const convertedKey = convertCoreViewKeyToViewKey(coreView.key);
  const convertedOpenRecordIn = convertCoreViewOpenRecordInToViewOpenRecordIn(
    coreView.openRecordIn,
  );
  const convertedType = convertCoreViewTypeToViewType(coreView.type);

  return {
    id: coreView.id,
    name: coreView.name,
    type: convertedType,
    key: convertedKey,
    objectMetadataId: coreView.objectMetadataId,
    isCompact: coreView.isCompact,
    viewFields: coreView.viewFields.map((viewField) =>
      convertCoreViewFieldToViewField(viewField),
    ),
    viewGroups: coreView.viewGroups.map((viewGroup) =>
      convertCoreViewGroupToViewGroup(viewGroup),
    ),
    viewFilters: coreView.viewFilters.map((viewFilter) =>
      convertCoreViewFilterToViewFilter(viewFilter),
    ),
    viewFilterGroups: coreView.viewFilterGroups?.map(
      convertCoreViewFilterGroupToViewFilterGroup,
    ),
    viewSorts: coreView.viewSorts,
    mainGroupByFieldMetadataId: coreView.mainGroupByFieldMetadataId ?? null,
    shouldHideEmptyGroups: coreView.shouldHideEmptyGroups,
    kanbanAggregateOperation: coreView.kanbanAggregateOperation ?? null,
    kanbanAggregateOperationFieldMetadataId:
      coreView.kanbanAggregateOperationFieldMetadataId ?? null,
    calendarFieldMetadataId: coreView.calendarFieldMetadataId ?? null,
    calendarLayout: coreView.calendarLayout ?? null,
    position: coreView.position,
    icon: coreView.icon,
    openRecordIn: convertedOpenRecordIn,
    anyFieldFilterValue: coreView.anyFieldFilterValue ?? null,
    visibility: coreView.visibility ?? ViewVisibility.UNLISTED,
    createdByUserWorkspaceId: coreView.createdByUserWorkspaceId,
    __typename: 'View',
  };
};
