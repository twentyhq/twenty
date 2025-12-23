import { SIDE_PANEL_FOCUS_ID } from '@/command-menu/constants/SidePanelFocusId';
import { useMergeRecordsActions } from '@/object-record/record-merge/hooks/useMergeRecordsActions';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';
import { t } from '@lingui/core/macro';
import { IconArrowMerge } from 'twenty-ui/display';
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
    <StyledFooterContainer>
      <StyledFooterActions>
        <Button
          title={isMerging ? t`Merging...` : t`Merge`}
          variant="primary"
          accent="blue"
          size="medium"
          Icon={IconArrowMerge}
          hotkeys={isMerging ? undefined : ['⌘', '⏎']}
          onClick={handleMergeRecords}
          disabled={isMerging}
        />
      </StyledFooterActions>
    </StyledFooterContainer>
  );
};
