import { gql } from '@apollo/client';

export const CREATE_SECTOR = gql`
  mutation CreateSector($createInput: CreateSectorInput!) {
    createSector(createInput: $createInput) {
      id
    }
  }
`;
