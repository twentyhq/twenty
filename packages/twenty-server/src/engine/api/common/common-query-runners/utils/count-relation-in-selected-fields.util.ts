import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';

export const countRelationInSelectedFields = (
  relations: CommonSelectedFields['relations'],
): number => {
  return Object.entries(relations).reduce((count, [_key, value]) => {
    if (typeof value === 'object' && value !== null) {
      return count + 1 + countRelationInSelectedFields(value);
    }

    return count + 1;
  }, 0);
};
