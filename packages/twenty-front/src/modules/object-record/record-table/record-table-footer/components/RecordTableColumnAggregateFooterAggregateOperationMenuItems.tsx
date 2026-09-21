import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { getDropdownMenuItemClickHandler } from '@/ui/layout/dropdown/utils/getDropdownMenuItemClickHandler';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { useViewFieldAggregateOperation } from '@/object-record/record-table/record-table-footer/hooks/useViewFieldAggregateOperation';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ListItem } from 'twenty-ui/primitives/navigation';

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
          onClick={getDropdownMenuItemClickHandler(async () => {
            await updateViewFieldAggregateOperation(operation);
            closeDropdown(dropdownId);
          })}
          role="option"
          indicator="check"
          selected={currentViewFieldAggregateOperation === operation}
          aria-selected={currentViewFieldAggregateOperation === operation}
        >
          <OverflowingTextWithTooltip
            text={getAggregateOperationLabel(operation)}
          />
        </ListItem>
      ))}
      {children}
      <ListItem
        key="none"
        onClick={getDropdownMenuItemClickHandler(async () => {
          await updateViewFieldAggregateOperation(null);
          resetContent();
          closeDropdown(dropdownId);
        })}
        role="option"
        indicator="check"
        selected={!isDefined(currentViewFieldAggregateOperation)}
        aria-selected={!isDefined(currentViewFieldAggregateOperation)}
      >
        <OverflowingTextWithTooltip text={t`None`} />
      </ListItem>
    </>
  );
};
