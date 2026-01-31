import { gql } from '@apollo/client';

export const UPLOAD_LOGIC_FUNCTION_SOURCE_CODE = gql`
  mutation UploadLogicFunctionSourceCode(
    $input: UploadLogicFunctionSourceCodeInput!
  ) {
    uploadLogicFunctionSourceCode(input: $input) {
      checksum
      success
    }
  }
`;
