import { isNonEmptyString } from '@sniptt/guards';
import { useRef } from 'react';
import { styled } from '@linaria/react';

import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { recordIndexHasRecordsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexHasRecordsComponentSelector';
import { RecordTableBodyEffectsWrapper } from '@/object-record/record-table/components/RecordTableBodyEffectsWrapper';
import { RecordTableContent } from '@/object-record/record-table/components/RecordTableContent';
import { RecordTableEmpty } from '@/object-record/record-table/components/RecordTableEmpty';
import { RecordTableScrollToFocusedCellEffect } from '@/object-record/record-table/components/RecordTableScrollToFocusedCellEffect';
import { RecordTableScrollToFocusedRowEffect } from '@/object-record/record-table/components/RecordTableScrollToFocusedRowEffect';
import { RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/RecordTableClickOutsideListenerId';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import isEmpty from 'lodash.isempty';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledLoadingBarWrapper = styled.div`
  height: 2px;
  left: 0;
  overflow: hidden;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 10;
`;

const StyledLoadingBar = styled.div`
  animation: loading-slide 1.4s ease-in-out infinite;
  background: linear-gradient(
    90deg,
    transparent 0%,
    ${themeCssVariables.color.blue} 40%,
    ${themeCssVariables.color.blue3} 60%,
    transparent 100%
  );
  height: 100%;
  width: 60%;

  @keyframes loading-slide {
    0% {
      transform: translateX(-100%);
    }
    60% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;

const StyledTableWrapper = styled.div`
  height: 100%;
  position: relative;
  width: 100%;
`;

export const RecordTable = () => {
  const {
    recordTableId,
    objectNameSingular,
    objectMetadataItem,
    visibleRecordFields,
  } = useRecordTableContextOrThrow();

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const tableBodyRef = useRef<HTMLDivElement>(null);

  const { toggleClickOutside } = useClickOutsideListener(
    RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID,
  );

  const isRecordTableInitialLoading = useAtomComponentStateValue(
    isRecordTableInitialLoadingComponentState,
    recordTableId,
  );

  const recordTableHasRecords = useAtomComponentSelectorValue(
    recordIndexHasRecordsComponentSelector,
    recordTableId,
  );

  const hasRecordGroups = useAtomComponentSelectorValue(
    hasRecordGroupsComponentSelector,
    recordTableId,
  );

  const { resetTableRowSelection } = useResetTableRowSelection(recordTableId);

  const recordTableIsEmpty =
    !isRecordTableInitialLoading && !recordTableHasRecords;

  if (!isNonEmptyString(objectNameSingular)) {
    return <></>;
  }

  const handleDragSelectionStart = () => {
    resetTableRowSelection();
    toggleClickOutside(false);
  };

  const handleDragSelectionEnd = () => {
    toggleClickOutside(true);
  };

  const isRefetching = isRecordTableInitialLoading && recordTableHasRecords;

  return (
    <>
      {objectPermissions.canReadObjectRecords && (
        <>
          <RecordTableBodyEffectsWrapper
            hasRecordGroups={hasRecordGroups}
            tableBodyRef={tableBodyRef}
          />
          <RecordTableScrollToFocusedCellEffect />
          <RecordTableScrollToFocusedRowEffect />
        </>
      )}
      {isRecordTableInitialLoading &&
      isEmpty(visibleRecordFields) ? null : recordTableIsEmpty &&
        !hasRecordGroups ? (
        <RecordTableEmpty tableBodyRef={tableBodyRef} />
      ) : (
        <StyledTableWrapper>
          {isRefetching && (
            <StyledLoadingBarWrapper>
              <StyledLoadingBar />
            </StyledLoadingBarWrapper>
          )}
          <RecordTableContent
            tableBodyRef={tableBodyRef}
            handleDragSelectionStart={handleDragSelectionStart}
            handleDragSelectionEnd={handleDragSelectionEnd}
            hasRecordGroups={hasRecordGroups}
            recordTableId={recordTableId}
          />
        </StyledTableWrapper>
      )}
    </>
  );
};
