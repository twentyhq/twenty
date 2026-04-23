import { hasSelectAllFieldsSelector } from 'src/engine/api/rest/metadata/query-builder/utils/has-select-all-fields-selector.util';
import { type Selectors } from 'src/engine/api/rest/metadata/types/metadata-query.type';

export const fetchMetadataFields = (
  objectNamePlural: string,
  selector: Selectors,
) => {
  const defaultFields = `
    id
    type
    name
    label
    description
    icon
    isCustom
    isActive
    isSystem
    isNullable
    createdAt
    updatedAt
    defaultValue
    options
    relation {
      type
      targetObjectMetadata {
        id
        nameSingular
        namePlural
      }
      targetFieldMetadata {
        id
        name
      }
      sourceObjectMetadata {
        id
        nameSingular
        namePlural
      }
      sourceFieldMetadata {
        id
        name
      }
    }
  `;

  const fieldsSelection = hasSelectAllFieldsSelector(selector)
    ? defaultFields
    : (selector?.fields?.join('\n') ?? defaultFields);

  switch (objectNamePlural) {
    case 'objects': {
      const objectsSelection =
        selector?.objects?.join('\n') ??
        `
        nameSingular
        namePlural
        labelSingular
        labelPlural
        description
        icon
        isCustom
        isActive
        isSystem
        createdAt
        updatedAt
        labelIdentifierFieldMetadataId
        imageIdentifierFieldMetadataId
      `;

      const fieldsPart = selector?.fields
        ? `
        fields(paging: { first: 1000 }) {
          edges {
            node {
              ${fieldsSelection}
            }
          }
        }
      `
        : '';

      return `
        ${objectsSelection}
        ${fieldsPart}
      `;
    }
    case 'fields':
      return fieldsSelection;
  }
};
