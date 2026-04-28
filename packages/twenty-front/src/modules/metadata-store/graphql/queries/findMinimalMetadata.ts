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
        roadmapFieldStartId
        roadmapFieldEndId
        roadmapFieldGroupId
        roadmapFieldColorId
        roadmapFieldLabelId
        roadmapFieldPlannedStartId
        roadmapFieldPlannedEndId
        roadmapFieldStatusId
        roadmapFieldBlockedById
        roadmapDefaultZoom
        roadmapShowToday
        roadmapShowWeekends
        roadmapShowDeviation
      }
      collectionHashes {
        collectionName
        hash
      }
    }
  }
`;
