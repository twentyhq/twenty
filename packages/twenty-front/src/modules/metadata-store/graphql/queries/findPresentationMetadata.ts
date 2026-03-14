import { gql } from '@apollo/client';

export const FIND_PRESENTATION_METADATA = gql`
  query FindPresentationMetadata {
    presentationMetadata {
      objectMetadataItems {
        id
        nameSingular
        namePlural
        labelSingular
        labelPlural
        icon
        isCustom
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
      metadataVersion
    }
  }
`;
