import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { useViewFieldAggregateOperation } from '@/object-record/record-table/record-table-footer/hooks/useViewFieldAggregateOperation';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

export const RecordTableColumnAggregateFooterAggregateOperationMenuItems = ({
  aggregateOperations,
  children,
}: {
  aggregateOperations: ExtendedAggregateOperations[];
  children?: ReactNode;
}) => {
  const { t } = useLingui();

  const {
    updateViewFieldAggregateOperation,
    currentViewFieldAggregateOperation,
  } = useViewFieldAggregateOperation();

  const { dropdownId, resetContent } = useContext(
    RecordTableColumnAggregateFooterDropdownContext,
  );
  const { closeDropdown } = useCloseDropdown();

  return (
    <>
      {aggregateOperations.map((operation) => (
        <MenuItem
          key={operation}
          onClick={async () => {
            await updateViewFieldAggregateOperation(operation);
            closeDropdown(dropdownId);
          }}
          text={getAggregateOperationLabel(operation)}
          RightIcon={
            currentViewFieldAggregateOperation === operation
              ? IconCheck
              : undefined
          }
          aria-selected={currentViewFieldAggregateOperation === operation}
        />
      ))}
      {children}
      <MenuItem
        key="none"
        onClick={async () => {
          await updateViewFieldAggregateOperation(null);
          resetContent();
          closeDropdown(dropdownId);
        }}
        text={t`None`}
        RightIcon={
          !isDefined(currentViewFieldAggregateOperation) ? IconCheck : undefined
        }
        aria-selected={!isDefined(currentViewFieldAggregateOperation)}
      />
    </>
  );
};
