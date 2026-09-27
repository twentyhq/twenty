import { gql } from '@apollo/client';

import { RECORD_IMPORT_FRAGMENT } from '@/record-import/graphql/recordImportFragment';

export const SET_RECORD_IMPORT_MAPPING = gql`
  ${RECORD_IMPORT_FRAGMENT}
  mutation SetRecordImportMapping($input: SetRecordImportMappingInput!) {
    setRecordImportMapping(input: $input) {
      ...RecordImportFields
    }
  }
`;
