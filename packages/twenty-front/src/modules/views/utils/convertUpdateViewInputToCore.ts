import { type GraphQLView } from '@/views/types/GraphQLView';
import { convertViewKeyToCore } from '@/views/utils/convertViewKeyToCore';
import { convertViewOpenRecordInToCore } from '@/views/utils/convertViewOpenRecordInToCore';
import { convertViewTypeToCore } from '@/views/utils/convertViewTypeToCore';
import { isDefined } from 'twenty-shared/utils';
import { type UpdateViewInput } from '~/generated-metadata/graphql';

export const convertUpdateViewInputToCore = (
  view: Partial<GraphQLView>,
): UpdateViewInput => {
  const {
    key,
    openRecordIn,
    type,
    viewFields: _viewFields,
    viewFilters: _viewFilters,
    viewFilterGroups: _viewFilterGroups,
    viewGroups: _viewGroups,
    viewSorts: _viewSorts,
    ...rest
  } = view;

  const convertedKey = isDefined(key) ? convertViewKeyToCore(key) : undefined;
  const convertedOpenRecordIn = isDefined(openRecordIn)
    ? convertViewOpenRecordInToCore(openRecordIn)
    : undefined;
  const convertedType = isDefined(type)
    ? convertViewTypeToCore(type)
    : undefined;

  return {
    ...rest,
    ...(convertedKey && { key: convertedKey }),
    ...(convertedOpenRecordIn && { openRecordIn: convertedOpenRecordIn }),
    ...(convertedType && { type: convertedType }),
  };
};
