import { gql } from '@apollo/client';

export const INSERT_COMPANY_FAVORITE = gql`
  mutation InsertCompanyFavorite($data: FavoriteMutationForCompanyArgs!) {
    createFavoriteForCompany(data: $data) {
      id
      company {
        id
        name
        domainName
      }
    }
  }
`;
