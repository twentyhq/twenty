import { gql } from '@apollo/client';

import { FieldType } from '@/ui/data/field/types/FieldType';

import { MetadataObject } from '../types/MetadataObject';

export const generateFindManyCustomObjectsQuery = ({
  metadataObject,
  _fromCursor,
}: {
  metadataObject: MetadataObject;
  _fromCursor?: string;
}) => {
  return gql`
    query FindMany${metadataObject.namePlural} {
      ${metadataObject.namePlural}{
        edges {
          node {
            id
            ${metadataObject.fields
              .map((field) => {
                // TODO: parse
                const fieldType = field.type as FieldType;

                if (fieldType === 'text') {
                  return field.name;
                } else if (fieldType === 'url') {
                  return `
                    ${field.name}
                    {
                      text
                      link
                    }
                  `;
                }
              })
              .join('\n')}
          }
          cursor
        }
      }
    }
  `;
};
