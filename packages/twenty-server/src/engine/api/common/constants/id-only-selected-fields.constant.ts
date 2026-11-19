import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';

export const ID_ONLY_SELECTED_FIELDS: CommonSelectedFields = {
  fields: { id: true },
  aggregates: [],
  relations: {},
};
