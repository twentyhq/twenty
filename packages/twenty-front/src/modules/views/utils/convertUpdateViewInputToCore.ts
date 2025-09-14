import { type GraphQLView } from '@/views/types/GraphQLView';
import { convertViewKeyToCore } from '@/views/utils/convertViewKeyToCore';
import { convertViewOpenRecordInToCore } from '@/views/utils/convertViewOpenRecordInToCore';
import { convertViewTypeToCore } from '@/views/utils/convertViewTypeToCore';
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

  return {
    id: view.id,
    ...(view.name && { name: view.name }),
    ...(view.icon && { icon: view.icon }),
    ...(view.position && { position: view.position }),
    ...(view.isCompact && { isCompact: view.isCompact }),
    ...(view.kanbanAggregateOperation && {
      kanbanAggregateOperation: view.kanbanAggregateOperation,
    }),
    ...(view.kanbanAggregateOperationFieldMetadataId && {
      kanbanAggregateOperationFieldMetadataId:
        view.kanbanAggregateOperationFieldMetadataId,
    }),
    ...(view.anyFieldFilterValue && {
      anyFieldFilterValue: view.anyFieldFilterValue,
    }),
    ...(convertedKey && { key: convertedKey }),
    ...(convertedOpenRecordIn && { openRecordIn: convertedOpenRecordIn }),
    ...(convertedType && { type: convertedType }),
    ...(isDefined(view.calendarLayout) && {
      calendarLayout: view.calendarLayout,
    }),
    ...(isDefined(view.calendarFieldMetadataId) && {
      calendarFieldMetadataId: view.calendarFieldMetadataId,
    }),
  };
};
