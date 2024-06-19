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
          fromRelationMetadata {
            id
            relationType
            toObjectMetadata {
              id
              dataSourceId
              nameSingular
              namePlural
              isSystem
            }
            toFieldMetadataId
          }
          toRelationMetadata {
            id
            relationType
            fromObjectMetadata {
              id
              dataSourceId
              nameSingular
              namePlural
              isSystem
            }
            fromFieldMetadataId
          }
          defaultValue
          options
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
    case 'relations':
      return `
          relationType
          fromObjectMetadata {
            id
            dataSourceId
            nameSingular
            namePlural
            isSystem
          }
          fromObjectMetadataId
          toObjectMetadata {
            id
            dataSourceId
            nameSingular
            namePlural
            isSystem
          }
          toObjectMetadataId
          fromFieldMetadataId
          toFieldMetadataId
        `;
  }
};
