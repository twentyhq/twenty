import { getIsOnDemandFieldEnabled } from '@/object-record/record-field/on-demand/utils/getIsOnDemandFieldEnabled';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableCellFocusedPortalContent } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFocusedPortalContent';
import { RecordTableCellPortalRootContainer } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortalRootContainer';
import { RecordTableCellPortalWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortalWrapper';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledFocusIndicator = styled.div`
  border-radius: ${themeCssVariables.border.radius.sm};
  inset: 0;
  outline: 1px solid ${themeCssVariables.color.blue8};
  outline-offset: -1px;
  pointer-events: none;
  position: absolute;
  z-index: ${TABLE_Z_INDEX.hoverPortal};
`;

export const RecordTableCellFocusedPortal = () => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();
  const { fieldMetadataItemByFieldMetadataItemId, isOnDemandFieldsEnabled } =
    useRecordIndexContextOrThrow();
  const recordTableFocusPosition = useAtomComponentStateValue(
    recordTableFocusPositionComponentState,
  );

  const recordTableHoverPosition = useAtomComponentStateValue(
    recordTableHoverPositionComponentState,
  );

  const isUnderHoveredPortal =
    isDefined(recordTableHoverPosition) &&
    isDefined(recordTableFocusPosition) &&
    recordTableHoverPosition.column === recordTableFocusPosition.column &&
    recordTableHoverPosition.row === recordTableFocusPosition.row;

  if (!isDefined(recordTableFocusPosition)) {
    return null;
  }

  const recordField = visibleRecordFields[recordTableFocusPosition.column];
  const fieldMetadataItem = isDefined(recordField)
    ? fieldMetadataItemByFieldMetadataItemId[recordField.fieldMetadataItemId]
    : undefined;

  if (
    getIsOnDemandFieldEnabled({
      isOnDemandFieldsEnabled,
      fieldMetadataItem,
    })
  ) {
    return (
      <RecordTableCellPortalWrapper position={recordTableFocusPosition}>
        <StyledFocusIndicator aria-hidden />
      </RecordTableCellPortalWrapper>
    );
  }

  if (isUnderHoveredPortal) {
    return null;
  }

  return (
    <RecordTableCellPortalWrapper position={recordTableFocusPosition}>
      <RecordTableCellPortalRootContainer zIndex={TABLE_Z_INDEX.hoverPortal}>
        <RecordTableCellFocusedPortalContent />
      </RecordTableCellPortalRootContainer>
    </RecordTableCellPortalWrapper>
  );
};
