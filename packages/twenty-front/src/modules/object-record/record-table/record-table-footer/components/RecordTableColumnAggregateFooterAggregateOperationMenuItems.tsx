import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { useViewFieldAggregateOperation } from '@/object-record/record-table/record-table-footer/hooks/useViewFieldAggregateOperation';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';

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

  const { dropdownId } = useContext(
    RecordTableColumnAggregateFooterDropdownContext,
  );
  const { closeDropdown } = useCloseDropdown();

  return (
    <>
      {aggregateOperations.map((operation) => (
        <Dropdown.OptionItem
          key={operation}
          closeOnSelect={false}
          onSelect={async () => {
            await updateViewFieldAggregateOperation(operation);
            closeDropdown(dropdownId);
          }}
          selected={currentViewFieldAggregateOperation === operation}
        >
          {getAggregateOperationLabel(operation)}
        </Dropdown.OptionItem>
      ))}
      {children}
      <Dropdown.OptionItem
        closeOnSelect={false}
        onSelect={async () => {
          await updateViewFieldAggregateOperation(null);
          closeDropdown(dropdownId);
        }}
        selected={!isDefined(currentViewFieldAggregateOperation)}
      >{t`None`}</Dropdown.OptionItem>
    </>
  );
};
