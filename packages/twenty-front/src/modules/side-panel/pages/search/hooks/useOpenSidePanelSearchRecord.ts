import { useCloseCommandMenu } from '@/command-menu-item/hooks/useCloseCommandMenu';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useNavigate } from 'react-router-dom';
import { AppPath, StandardObjectNameSingular } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

const SIDE_PANEL_OBJECT_NAME_SINGULARS: string[] = [
  StandardObjectNameSingular.Task,
  StandardObjectNameSingular.Note,
];

export const useOpenSidePanelSearchRecord = () => {
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const { closeCommandMenu } = useCloseCommandMenu();
  const navigate = useNavigate();

  const openSidePanelSearchRecord = ({
    objectNameSingular,
    recordId,
  }: {
    objectNameSingular: string;
    recordId: string;
  }) => {
    if (SIDE_PANEL_OBJECT_NAME_SINGULARS.includes(objectNameSingular)) {
      openRecordInSidePanel({ recordId, objectNameSingular });

      return;
    }

    closeCommandMenu();
    navigate(
      getAppPath(AppPath.RecordShowPage, {
        objectNameSingular,
        objectRecordId: recordId,
      }),
    );
  };

  return { openSidePanelSearchRecord };
};
