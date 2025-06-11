export const fetchMetadataFields = (objectNamePlural: string) => {
  const fields = `
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

  switch (objectNamePlural) {
    case 'objects':
      return `
          dataSourceId
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
          fields(paging: { first: 1000 }) {
            edges {
              node {
                id
                ${fields}
              }
            }
          }
        `;
    case 'fields':
      return fields;
  }
};
