import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useMergeRecordsActions } from '@/object-record/record-merge/hooks/useMergeRecordsActions';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { Key } from 'ts-key-enum';
import { t } from '@lingui/core/macro';
import { IconArrowMerge } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

type MergeRecordsFooterProps = {
  objectNameSingular: string;
};

export const MergeRecordsFooter = ({
  objectNameSingular,
}: MergeRecordsFooterProps) => {
  const { handleMergeRecords, isMerging } = useMergeRecordsActions({
    objectNameSingular,
  });

  useHotkeysOnFocusedElement({
    keys: [`${Key.Control}+${Key.Enter}`, `${Key.Meta}+${Key.Enter}`],
    callback: () => {
      if (!isMerging) {
        handleMergeRecords();
      }
    },
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [handleMergeRecords, isMerging],
  });

  return (
    <SidePanelFooter
      actions={[
        <Button
          key="merge"
          size="md"
          startIcon={<IconArrowMerge />}
          shortcut={isMerging ? undefined : ['Mod', 'Enter']}
          onClick={handleMergeRecords}
          disabled={isMerging}
          variant="solid"
          color="accent"
        >
          {isMerging ? t`Merging...` : t`Merge`}
        </Button>,
      ]}
    />
  );
};
