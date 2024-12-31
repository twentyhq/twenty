import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { RecordTableColumnAggregateFooterAggregateOperationMenuItems } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterAggregateOperationMenuItems';
import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useContext } from 'react';
import { Key } from 'ts-key-enum';
import { IconChevronLeft } from 'twenty-ui';

export const RecordTableColumnAggregateFooterDropdownSubmenuContent = ({
  aggregateOperations,
  title,
}: {
  aggregateOperations: AGGREGATE_OPERATIONS[];
  title: string;
}) => {
  const { dropdownId, resetContent } = useContext(
    RecordTableColumnAggregateFooterDropdownContext,
  );
  const { closeDropdown } = useDropdown(dropdownId);
  //   const { objectMetadataItem } = useRecordTableContextOrThrow();

  useScopedHotkeys(
    [Key.Escape],
    () => {
      resetContent();
      closeDropdown();
    },
    TableOptionsHotkeyScope.Dropdown,
  );

  //   const CONTENT_ID_CONFIG = useMemo(() => {
  //     return {
  //       countAggregateOperationsOptions: {
  //         filter: (aggregateOperation: AGGREGATE_OPERATIONS) =>
  //           COUNT_AGGREGATE_OPERATION_OPTIONS.includes(aggregateOperation),
  //         title: 'Count',
  //       },
  //       moreAggregateOperationOptions: {
  //         filter: (aggregateOperation: AGGREGATE_OPERATIONS) =>
  //           !COUNT_AGGREGATE_OPERATION_OPTIONS.includes(aggregateOperation) &&
  //           !PERCENT_AGGREGATE_OPERATION_OPTIONS.includes(aggregateOperation),
  //         title: 'More options',
  //       },
  //       percentAggregateOperationsOptions: {
  //         filter: (aggregateOperation: AGGREGATE_OPERATIONS) =>
  //           PERCENT_AGGREGATE_OPERATION_OPTIONS.includes(aggregateOperation),
  //         title: 'Percent',
  //       },
  //     };
  //   }, []);

  //   const availableAggregateOperations = useMemo(() => {
  //     const field = objectMetadataItem.fields.find(
  //       (field) => field.id === fieldMetadataId,
  //     );

  //     return getAvailableAggregateOperationsForFieldMetadataType({
  //       fieldMetadataType: field?.type,
  //     }).filter(CONTENT_ID_CONFIG[currentContentId].filter);
  //   }, [
  //     CONTENT_ID_CONFIG,
  //     currentContentId,
  //     fieldMetadataId,
  //     objectMetadataItem.fields,
  //   ]);

  //   const title = CONTENT_ID_CONFIG[currentContentId].title;
  return (
    <>
      <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetContent}>
        {title}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <RecordTableColumnAggregateFooterAggregateOperationMenuItems
          aggregateOperations={aggregateOperations}
        />
      </DropdownMenuItemsContainer>
    </>
  );
};
