import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useMergeRecordsActions } from '@/object-record/record-merge/hooks/useMergeRecordsActions';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { styled } from '@linaria/react';
import { Key } from 'ts-key-enum';
import { t } from '@lingui/core/macro';
import { IconArrowMerge } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledFooterContainer = styled.div`
  align-items: flex-end;
  background: ${themeCssVariables.background.primary};
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledFooterActions = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
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
