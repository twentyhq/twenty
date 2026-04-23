import { type Selectors } from 'src/engine/api/rest/metadata/types/metadata-query.type';

export const hasSelectAllFieldsSelector = (selector: Selectors) => {
  return (
    selector?.fields?.length &&
    selector?.fields.length === 1 &&
    selector?.fields.includes('*')
  );
};
