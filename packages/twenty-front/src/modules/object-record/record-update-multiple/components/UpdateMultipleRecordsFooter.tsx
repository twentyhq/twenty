import { computeProgressText } from '@/command-menu-item/utils/computeProgressText';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { type ObjectRecordQueryProgress } from '@/object-record/types/ObjectRecordQueryProgress';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useLingui } from '@lingui/react/macro';

import { Key } from 'ts-key-enum';
import { IconBoxMultiple } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

type UpdateMultipleRecordsFooterProps = {
  isUpdating: boolean;
  progress?: ObjectRecordQueryProgress;
  onUpdate: () => void;
  onCancel: () => void;
  isUpdateDisabled?: boolean;
};

export const UpdateMultipleRecordsFooter = ({
  isUpdating,
  progress,
  onUpdate,
  onCancel,
  isUpdateDisabled,
}: UpdateMultipleRecordsFooterProps) => {
  const { t } = useLingui();
  const progressText = computeProgressText(progress);

  useHotkeysOnFocusedElement({
    keys: [`${Key.Control}+${Key.Enter}`, `${Key.Meta}+${Key.Enter}`],
    callback: () => {
      if (!isUpdating && !isUpdateDisabled) {
        onUpdate();
      }
    },
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [onUpdate, isUpdating, isUpdateDisabled],
  });

  return (
    <SidePanelFooter
      actions={[
        <Button
          key="cancel"
          size="sm"
          onClick={onCancel}
          variant="outline"
        >{t`Cancel`}</Button>,
        <Button
          key="apply"
          size="sm"
          startIcon={<IconBoxMultiple />}
          loading={isUpdating && !progressText}
          shortcut={isUpdating ? undefined : ['Mod', 'Enter']}
          onClick={onUpdate}
          disabled={isUpdating || isUpdateDisabled}
          variant="solid"
          color="accent"
        >
          {isUpdating ? t`Apply${progressText}` : t`Apply`}
        </Button>,
      ]}
    />
  );
};
