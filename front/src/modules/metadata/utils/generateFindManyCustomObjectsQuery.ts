import { gql } from '@apollo/client';

import { MetadataObject } from '../types/MetadataObject';

export const generateFindManyCustomObjectsQuery = ({
  metadataObject,
  _fromCursor,
}: {
  metadataObject: MetadataObject;
  _fromCursor?: string;
}) => {
  return gql`
    query CustomQuery${metadataObject.nameSingular} {
      findMany${metadataObject.nameSingular}{
        edges {
          node {
            id
            ${metadataObject.fields.map((field) => field.name).join('\n')}
          }
          cursor
        }
      }
    }
  `;
};
