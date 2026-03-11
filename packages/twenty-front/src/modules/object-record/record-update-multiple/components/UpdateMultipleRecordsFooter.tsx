import { computeProgressText } from '@/command-menu-item/utils/computeProgressText';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { type ObjectRecordQueryProgress } from '@/object-record/types/ObjectRecordQueryProgress';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { Key } from 'ts-key-enum';
import { IconBoxMultiple } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

const StyledFooterContainer = styled.div`
  align-items: flex-end;
  background: ${themeCssVariables.background.primary};
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledFooterActions = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

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
    <StyledFooterContainer>
      <StyledFooterActions>
        <Button
          title={t`Cancel`}
          variant="secondary"
          size="small"
          onClick={onCancel}
        />
        <Button
          title={isUpdating ? t`Apply${progressText}` : t`Apply`}
          variant="primary"
          accent="blue"
          size="small"
          Icon={IconBoxMultiple}
          isLoading={isUpdating && !progressText}
          hotkeys={isUpdating ? undefined : ['⌘', '⏎']}
          onClick={onUpdate}
          disabled={isUpdating || isUpdateDisabled}
        />
      </StyledFooterActions>
    </StyledFooterContainer>
  );
};
