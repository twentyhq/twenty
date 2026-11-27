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
        universalIdentifier
        name
        icon
        type
        key
        objectMetadataId
        position
        isPrivate
        isActive
      }
      objectViewsHashes {
        objectMetadataId
        hash
      }
      collectionHashes {
        collectionName
        hash
      }
    }
  }
`;
