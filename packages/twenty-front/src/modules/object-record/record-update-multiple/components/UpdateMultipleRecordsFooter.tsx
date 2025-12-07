import { SIDE_PANEL_FOCUS_ID } from '@/command-menu/constants/SidePanelFocusId';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';

import { computeProgressText } from '@/action-menu/utils/computeProgressText';
import { type ObjectRecordQueryProgress } from '@/object-record/types/ObjectRecordQueryProgress';
import { IconEdit } from '@tabler/icons-react';
import { Key } from 'ts-key-enum';
import { Button } from 'twenty-ui/input';

const StyledFooterContainer = styled.div`
  align-items: flex-end;
  background: ${({ theme }) => theme.background.primary};
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-end;
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledFooterActions = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type UpdateMultipleRecordsFooterProps = {
  isUpdating: boolean;
  onUpdate: () => void;
  onCancel: () => void;
  isUpdateDisabled?: boolean;
  progress?: ObjectRecordQueryProgress;
};

export const UpdateMultipleRecordsFooter = ({
  isUpdating,
  onUpdate,
  onCancel,
  isUpdateDisabled,
  progress,
}: UpdateMultipleRecordsFooterProps) => {
  const { t } = useLingui();

  useHotkeysOnFocusedElement({
    keys: [`${Key.Control}+${Key.Enter}`, `${Key.Meta}+${Key.Enter}`],
    callback: () => {
      if (!isUpdating && !isUpdateDisabled) {
        onUpdate();
      }
    },
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [onUpdate, isUpdating],
  });

  return (
    <StyledFooterContainer>
      <StyledFooterActions>
        <Button
          title={t`Cancel`}
          variant="secondary"
          size="medium"
          onClick={onCancel}
        />
        <Button
          title={t`Update${computeProgressText(progress)}`}
          variant="primary"
          accent="blue"
          size="medium"
          Icon={IconEdit}
          hotkeys={isUpdating || isUpdateDisabled ? undefined : ['⌘', '⏎']}
          onClick={onUpdate}
          disabled={isUpdating || isUpdateDisabled}
        />
      </StyledFooterActions>
    </StyledFooterContainer>
  );
};
