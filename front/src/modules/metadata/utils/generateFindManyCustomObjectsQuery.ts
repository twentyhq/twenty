import { gql } from '@apollo/client';

import { MetadataObject } from '../types/MetadataObject';

export const generateFindManyCustomObjectsQuery = ({
  metadataObject,
  fromCursor,
}: {
  metadataObject: MetadataObject;
  fromCursor?: string;
}) => {
  return gql`
    query CustomQuery${metadataObject.nameSingular} {
      findMany${metadataObject.nameSingular}{
        edges {
          node {
            id
            ${metadataObject.fields
              .map((field) => field.nameSingular)
              .join('\n')}
          }
          cursor
        }
      }
    }
  `;
};
