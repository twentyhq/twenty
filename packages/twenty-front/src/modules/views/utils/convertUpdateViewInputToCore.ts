import { type GraphQLView } from '@/views/types/GraphQLView';
import { convertViewKeyToCore } from '@/views/utils/convertViewKeyToCore';
import { convertViewOpenRecordInToCore } from '@/views/utils/convertViewOpenRecordInToCore';
import { convertViewTypeToCore } from '@/views/utils/convertViewTypeToCore';
import { convertViewVisibilityToCore } from '@/views/utils/convertViewVisibilityToCore';
import { isDefined } from 'twenty-shared/utils';
import { type UpdateViewInput } from '~/generated/graphql';

export const convertUpdateViewInputToCore = (
  view: Partial<GraphQLView & { __typename?: string }>,
): UpdateViewInput => {
  const convertedKey = isDefined(view.key)
    ? convertViewKeyToCore(view.key)
    : undefined;
  const convertedOpenRecordIn = isDefined(view.openRecordIn)
    ? convertViewOpenRecordInToCore(view.openRecordIn)
    : undefined;
  const convertedType = isDefined(view.type)
    ? convertViewTypeToCore(view.type)
    : undefined;
  const convertedVisibility = isDefined(view.visibility)
    ? convertViewVisibilityToCore(view.visibility)
    : undefined;

  return {
    id: view.id,
    ...(view.name && { name: view.name }),
    ...(view.icon && { icon: view.icon }),
    ...(isDefined(view.position) && { position: view.position }),
    ...(isDefined(view.isCompact) && { isCompact: view.isCompact }),
    ...(isDefined(view.kanbanAggregateOperation) && {
      kanbanAggregateOperation: view.kanbanAggregateOperation,
    }),
    ...(isDefined(view.kanbanAggregateOperationFieldMetadataId) && {
      kanbanAggregateOperationFieldMetadataId:
        view.kanbanAggregateOperationFieldMetadataId,
    }),
    ...(isDefined(view.anyFieldFilterValue) && {
      anyFieldFilterValue: view.anyFieldFilterValue,
    }),
    ...(isDefined(convertedKey) && { key: convertedKey }),
    ...(isDefined(convertedOpenRecordIn) && {
      openRecordIn: convertedOpenRecordIn,
    }),
    ...(isDefined(convertedType) && { type: convertedType }),
    ...(isDefined(view.calendarLayout) && {
      calendarLayout: view.calendarLayout,
    }),
    ...(isDefined(view.calendarFieldMetadataId) && {
      calendarFieldMetadataId: view.calendarFieldMetadataId,
    }),
    ...(isDefined(convertedVisibility) && { visibility: convertedVisibility }),
  };
};
