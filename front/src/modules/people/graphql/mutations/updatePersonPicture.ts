import { gql } from '@apollo/client';

export const UPDATE_PERSON_PICTURE = gql`
  mutation UploadPersonPicture($id: String!, $file: Upload!) {
    uploadPersonPicture(id: $id, file: $file)
  }
`;
