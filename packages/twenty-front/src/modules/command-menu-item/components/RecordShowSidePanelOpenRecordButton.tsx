import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconAddressBook } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { getOsControlSymbol } from 'twenty-ui/utilities';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useNavigateToRecordPageFromSidePanel } from '@/side-panel/pages/record-page/hooks/useNavigateToRecordPageFromSidePanel';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

type RecordShowSidePanelOpenRecordButtonProps = {
  objectNameSingular: string;
  recordId: string;
};

export const RecordShowSidePanelOpenRecordButton = ({
  objectNameSingular,
  recordId,
}: RecordShowSidePanelOpenRecordButtonProps) => {
  const record = useAtomFamilyStateValue(recordStoreFamilyState, recordId) as
    | ObjectRecord
    | null
    | undefined;

  const { navigateToRecordPage } = useNavigateToRecordPageFromSidePanel();

  const handleOpenRecord = useCallback(() => {
    navigateToRecordPage({ objectNameSingular, recordId });
  }, [navigateToRecordPage, objectNameSingular, recordId]);

  useHotkeysOnFocusedElement({
    keys: ['ctrl+Enter,meta+Enter'],
    callback: handleOpenRecord,
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [handleOpenRecord],
  });

  if (!isDefined(record)) {
    return null;
  }

  return (
    <Button
      title={t`Open`}
      variant="primary"
      accent="blue"
      size="small"
      Icon={IconAddressBook}
      hotkeys={[getOsControlSymbol(), '⏎']}
      onClick={handleOpenRecord}
    />
  );
};
