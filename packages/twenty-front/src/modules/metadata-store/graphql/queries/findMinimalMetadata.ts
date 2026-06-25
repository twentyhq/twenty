import { gql } from '@apollo/client';

export const FIND_MINIMAL_METADATA = gql`
  query FindMinimalMetadata {
    minimalMetadata {
      objectMetadataItems {
        id
        nameSingular
        namePlural
        labelSingular
        labelPlural
        icon
        isActive
        isSystem
        isRemote
      }
      views {
        id
        type
        key
        objectMetadataId
      }
      collectionHashes {
        collectionName
        hash
      }
    }
  }
`;
