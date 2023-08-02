import { useEffect, useState } from 'react';

import { GetFavoritesQuery, useGetFavoritesQuery } from '~/generated/graphql';

export function useFavorites() {
  const { data } = useGetFavoritesQuery();
  const [favorites, setFavorites] = useState<GetFavoritesQuery>();
  useEffect(() => {
    setFavorites(data);
  }, [data, setFavorites]);

  return favorites;
}
