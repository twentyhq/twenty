import gql from 'graphql-tag';

export const RELATED_RECORD_PATH_FRAGMENT = gql`
  fragment RelatedRecordPathFragment on RelatedRecordPath {
    id
    objectMetadataId
    firstFieldMetadataId
    secondFieldMetadataId
    thirdFieldMetadataId
    isInherent
  }
`;
