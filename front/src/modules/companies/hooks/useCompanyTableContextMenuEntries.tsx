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
import { selectedRowIdsSelector } from '@/ui/table/states/selectors/selectedRowIdsSelector';
import { ActivityType } from '~/generated/graphql';

import { useCompanyQuery } from './useCompanyQuery';
import { useDeleteSelectedComapnies } from './useDeleteCompanies';

export const useCompanyTableContextMenuEntries = () => {
  const setContextMenuEntries = useSetRecoilState(contextMenuEntriesState);

  const openCreateActivityRightDrawer =
    useOpenCreateActivityDrawerForSelectedRowIds();

  const handleButtonClick = async (type: ActivityType) => {
    openCreateActivityRightDrawer(type, ActivityTargetableEntityType.Company);
  };

  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);

  const companyId = selectedRowIds.length === 1 ? selectedRowIds[0] : '';

  const { data } = useCompanyQuery(companyId);

  const company = data?.findUniqueCompany;

  const isFavorite = !!company?.Favorite && company.Favorite.length > 0;

  const { insertCompanyFavorite, deleteCompanyFavorite } = useFavorites();

  const handleFavoriteButtonClick = async () => {
    if (isFavorite) deleteCompanyFavorite(companyId);
    else insertCompanyFavorite(companyId);
  };

  const deleteSelectedCompanies = useDeleteSelectedComapnies();

  return {
    setContextMenuEntries: () =>
      setContextMenuEntries([
        {
          label: 'New Task',
          Icon: IconCheckbox,
          onClick: () => handleButtonClick(ActivityType.Task),
        },
        {
          label: 'New Note',
          Icon: IconNotes,
          onClick: () => handleButtonClick(ActivityType.Note),
        },
        ...(!!company
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
