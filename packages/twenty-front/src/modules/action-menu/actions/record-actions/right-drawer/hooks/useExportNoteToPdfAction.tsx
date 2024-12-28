import { useContext } from 'react';

import { RightDrawerActionKeys } from '@/action-menu/actions/record-actions/right-drawer/types/RightDrawerActionKeys';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { IconFileExport } from 'twenty-ui';

export const useExportNoteToPdfAction = () => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const exportToPdf = async () => {
    // [Issue 8439] TODO: Implement PDF export
  };

  const { onActionStartedCallback, onActionExecutedCallback } =
    useContext(ActionMenuContext);

  const registerExportToPdfAction = ({ position }: { position: number }) => {
    addActionMenuEntry({
      key: RightDrawerActionKeys.EXPORT_NOTE_TO_PDF,
      label: 'Export to PDF',
      shortLabel: 'Export PDF',
      Icon: IconFileExport,
      onClick: async () => {
        await onActionStartedCallback?.({
          key: RightDrawerActionKeys.EXPORT_NOTE_TO_PDF,
        });
        await exportToPdf();
        await onActionExecutedCallback?.({
          key: RightDrawerActionKeys.EXPORT_NOTE_TO_PDF,
        });
      },
      type: ActionMenuEntryType.Standard,
      scope: ActionMenuEntryScope.RightDrawer,
      position,
    });
  };

  const unregisterExportToPdfAction = () => {
    removeActionMenuEntry(RightDrawerActionKeys.EXPORT_NOTE_TO_PDF);
  };

  return {
    registerExportToPdfAction,
    unregisterExportToPdfAction,
  };
};
