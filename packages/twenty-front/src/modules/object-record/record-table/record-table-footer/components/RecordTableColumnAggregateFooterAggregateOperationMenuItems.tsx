import { ListItem } from 'twenty-ui/primitives/navigation';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { useViewFieldAggregateOperation } from '@/object-record/record-table/record-table-footer/hooks/useViewFieldAggregateOperation';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

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
        <ListItem
          key={operation}
          onClick={async () => {
            await updateViewFieldAggregateOperation(operation);
            closeDropdown(dropdownId);
          }}
          role="option"
          indicator="check"
          selected={currentViewFieldAggregateOperation === operation}
          aria-selected={currentViewFieldAggregateOperation === operation}
        >
          {getAggregateOperationLabel(operation)}
        </ListItem>
      ))}
      {children}
      <ListItem
        onClick={async () => {
          await updateViewFieldAggregateOperation(null);
          resetContent();
          closeDropdown(dropdownId);
        }}
        role="option"
        indicator="check"
        selected={!isDefined(currentViewFieldAggregateOperation)}
        aria-selected={!isDefined(currentViewFieldAggregateOperation)}
      >{t`None`}</ListItem>
    </>
  );
};
