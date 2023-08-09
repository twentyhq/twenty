import { getOperationName } from '@apollo/client/utilities';

import { GET_COMPANY } from '@/companies/queries';
import { GET_PERSON } from '@/people/queries/show';
import {
  useDeleteFavoriteMutation,
  useInsertCompanyFavoriteMutation,
  useInsertPersonFavoriteMutation,
} from '~/generated/graphql';

import { GET_FAVORITES } from '../queries/show';

export function useFavorites() {
  const [insertCompanyFavoriteMutation] = useInsertCompanyFavoriteMutation();
  const [insertPersonFavoriteMutation] = useInsertPersonFavoriteMutation();
  const [deleteFavoriteMutation] = useDeleteFavoriteMutation();

  const InsertCompanyFavorite = (companyId: string) => {
    insertCompanyFavoriteMutation({
      variables: {
        data: {
          companyId,
        },
      },
      refetchQueries: [
        getOperationName(GET_FAVORITES) ?? '',
        getOperationName(GET_COMPANY) ?? '',
      ],
    });
  };

  const InsertPersonFavorite = (personId: string) => {
    insertPersonFavoriteMutation({
      variables: {
        data: {
          personId,
        },
      },
      refetchQueries: [
        getOperationName(GET_FAVORITES) ?? '',
        getOperationName(GET_PERSON) ?? '',
      ],
    });
  };

  const DeleteCompanyFavorite = (companyId: string) => {
    deleteFavoriteMutation({
      variables: {
        where: {
          companyId: {
            equals: companyId,
          },
        },
      },
      refetchQueries: [
        getOperationName(GET_FAVORITES) ?? '',
        getOperationName(GET_COMPANY) ?? '',
      ],
    });
  };

  const DeletePersonFavorite = (personId: string) => {
    deleteFavoriteMutation({
      variables: {
        where: {
          personId: {
            equals: personId,
          },
        },
      },
      refetchQueries: [
        getOperationName(GET_FAVORITES) ?? '',
        getOperationName(GET_PERSON) ?? '',
      ],
    });
  };

  return {
    InsertCompanyFavorite,
    InsertPersonFavorite,
    DeleteCompanyFavorite,
    DeletePersonFavorite,
  };
}
