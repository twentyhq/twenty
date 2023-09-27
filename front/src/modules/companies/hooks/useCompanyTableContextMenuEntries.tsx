import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useOpenCreateActivityDrawerForSelectedRowIds } from '@/activities/hooks/useOpenCreateActivityDrawerForSelectedRowIds';
import { ActivityTargetableEntityType } from '@/activities/types/ActivityTargetableEntity';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { contextMenuEntriesState } from '@/ui/context-menu/states/contextMenuEntriesState';
import {
  IconCheckbox,
  IconHeart,
  IconHeartOff,
  IconNotes,
  IconTrash,
} from '@/ui/icon';
import { useResetTableRowSelection } from '@/ui/table/hooks/useResetTableRowSelection';
import { selectedRowIdsSelector } from '@/ui/table/states/selectors/selectedRowIdsSelector';
import { ActivityType, useGetFavoritesQuery } from '~/generated/graphql';

import { useDeleteSelectedComapnies } from './useDeleteCompanies';

export const useCompanyTableContextMenuEntries = () => {
  const setContextMenuEntries = useSetRecoilState(contextMenuEntriesState);

  const openCreateActivityRightDrawer =
    useOpenCreateActivityDrawerForSelectedRowIds();

  const handleButtonClick = async (type: ActivityType) => {
    openCreateActivityRightDrawer(type, ActivityTargetableEntityType.Company);
  };

  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);

  const selectedCompanyId =
    selectedRowIds.length === 1 ? selectedRowIds[0] : '';

  const { insertCompanyFavorite, deleteCompanyFavorite } = useFavorites();

  const resetRowSelection = useResetTableRowSelection();

  const { data } = useGetFavoritesQuery();

  const favorites = data?.findFavorites;

  const isFavorite =
    !!selectedCompanyId &&
    !!favorites?.find((favorite) => favorite.company?.id === selectedCompanyId);

  const handleFavoriteButtonClick = () => {
    resetRowSelection();
    if (isFavorite) deleteCompanyFavorite(selectedCompanyId);
    else insertCompanyFavorite(selectedCompanyId);
  };

  const deleteSelectedCompanies = useDeleteSelectedComapnies();

  return {
    setContextMenuEntries: () =>
      setContextMenuEntries([
        {
          label: 'New task',
          Icon: IconCheckbox,
          onClick: () => handleButtonClick(ActivityType.Task),
        },
        {
          label: 'New note',
          Icon: IconNotes,
          onClick: () => handleButtonClick(ActivityType.Note),
        },
        ...(!!selectedCompanyId
          ? [
              {
                label: isFavorite
                  ? 'Remove from favorites'
                  : 'Add to favorites',
                Icon: isFavorite ? IconHeartOff : IconHeart,
                onClick: () => handleFavoriteButtonClick(),
              },
            ]
          : []),
        {
          label: 'Delete',
          Icon: IconTrash,
          accent: 'danger',
          onClick: () => deleteSelectedCompanies(),
        },
      ]),
  };
};
