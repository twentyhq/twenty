import { computeProgressText } from '@/action-menu/utils/computeProgressText';
import { SIDE_PANEL_FOCUS_ID } from '@/command-menu/constants/SidePanelFocusId';
import { type ObjectRecordQueryProgress } from '@/object-record/types/ObjectRecordQueryProgress';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';

import { Key } from 'ts-key-enum';
import { IconBoxMultiple } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

const StyledFooterContainer = styled.div`
  align-items: flex-end;
  background: ${({ theme }) => theme.background.primary};
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-end;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledFooterActions = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing(2)};
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
