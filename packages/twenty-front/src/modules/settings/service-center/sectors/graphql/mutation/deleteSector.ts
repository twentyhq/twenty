import { gql } from '@apollo/client';

export const DELETE_SECTOR_BY_ID = gql`
  mutation DeleteSector($sectorId: String!) {
    deleteSector(sectorId: $sectorId)
  }
`;
