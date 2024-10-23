import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';

export const useFavoriteFolders = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { objectMetadataItem: favoriteFolderObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.FavoriteFolder,
    });

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.FavoriteFolder,
  });

  const { updateOneRecord: updateOneFavorite } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.FavoriteFolder,
  });

  const { createOneRecord: createFavoriteFolder } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.FavoriteFolder,
  });

  const { records: favoriteFolder } = usePrefetchedData<FavoriteFolder>(
    PrefetchKey.AllFavoritesFolders,
    {
      workspaceMemberId: {
        eq: undefined,
      },
    },
  );

  return {
    favoriteFolder,
    createFavoriteFolder,
  };
};
