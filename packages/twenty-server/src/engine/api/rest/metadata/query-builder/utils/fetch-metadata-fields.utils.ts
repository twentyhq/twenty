export const fetchMetadataFields = (objectNamePlural: string) => {
  const fromRelations = `
          toObjectMetadata {
            id
            dataSourceId
            nameSingular
            namePlural
            isSystem
            isRemote
          }
          toFieldMetadataId
        `;

  const toRelations = `
          fromObjectMetadata {
            id
            dataSourceId
            nameSingular
            namePlural
            isSystem
            isRemote
          }
          fromFieldMetadataId
        `;

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
            ${fromRelations}
          }
          toRelationMetadata {
            id
            relationType
            ${toRelations}
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
          id
          relationType
          ${fromRelations}
          ${toRelations}
        `;
  }
};
