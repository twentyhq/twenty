import { useNavigate } from 'react-router-dom';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { type SearchResultItem } from '@/search/types/SearchResultItem';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';

const OBJECTS_OPENED_IN_SIDE_PANEL: string[] = [
  CoreObjectNameSingular.Task,
  CoreObjectNameSingular.Note,
];

type UseOpenSearchResultItemParams = {
  onBeforeNavigateToRecordPage?: () => void;
};

export const useOpenSearchResultItem = ({
  onBeforeNavigateToRecordPage,
}: UseOpenSearchResultItemParams = {}) => {
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const navigate = useNavigate();

  const openSearchResultItem = (item: SearchResultItem) => {
    if (OBJECTS_OPENED_IN_SIDE_PANEL.includes(item.objectNameSingular)) {
      openRecordInSidePanel({
        recordId: item.recordId,
        objectNameSingular: item.objectNameSingular as CoreObjectNameSingular,
      });

      return;
    }

    onBeforeNavigateToRecordPage?.();

    navigate(
      getAppPath(AppPath.RecordShowPage, {
        objectNameSingular: item.objectNameSingular,
        objectRecordId: item.recordId,
      }),
    );
  };

  return { openSearchResultItem };
};
