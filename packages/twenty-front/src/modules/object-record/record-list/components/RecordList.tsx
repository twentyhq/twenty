import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { RecordListBody } from '@/object-record/record-list/components/RecordListBody';
import { RecordListDragDropProvider } from '@/object-record/record-list/components/RecordListDragDropProvider';
import { RecordListFieldTooltip } from '@/object-record/record-list/components/RecordListFieldTooltip';
import { RecordListRecordGroupsBody } from '@/object-record/record-list/components/RecordListRecordGroupsBody';
import { RecordListResponsiveFieldsEffect } from '@/object-record/record-list/components/RecordListResponsiveFieldsEffect';
import { RecordListComponentInstanceContext } from '@/object-record/record-list/states/contexts/RecordListComponentInstanceContext';
import { RecordSelectionEscapeHotkeyEffect } from '@/object-record/record-selection/components/RecordSelectionEscapeHotkeyEffect';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: ${themeCssVariables.spacing[2]};
  padding-left: ${themeCssVariables.spacing[1]};
`;

export const RecordList = () => {
  const recordListId = useAvailableComponentInstanceIdOrThrow(
    RecordListComponentInstanceContext,
  );

  const hasRecordGroups = useAtomComponentSelectorValue(
    hasRecordGroupsComponentSelector,
  );

  const [containerElement, setContainerElement] =
    useState<HTMLDivElement | null>(null);

  return (
    <StyledContainer ref={setContainerElement}>
      <RecordListResponsiveFieldsEffect containerElement={containerElement} />
      <RecordSelectionEscapeHotkeyEffect />
      <RecordListFieldTooltip>
        <ScrollWrapper
          componentInstanceId={`scroll-wrapper-record-list-${recordListId}`}
          defaultEnableXScroll={false}
        >
          <RecordListDragDropProvider>
            {hasRecordGroups ? (
              <RecordListRecordGroupsBody />
            ) : (
              <RecordListBody />
            )}
          </RecordListDragDropProvider>
        </ScrollWrapper>
      </RecordListFieldTooltip>
    </StyledContainer>
  );
};
