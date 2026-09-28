import { t } from '@lingui/core/macro';
import { useGetButtonIcon } from '@/object-record/record-field/ui/hooks/useGetButtonIcon';
import { useIsFieldInputOnly } from '@/object-record/record-field/ui/hooks/useIsFieldInputOnly';

import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableCellButtons } from '@/object-record/record-table/record-table-cell/components/RecordTableCellButtons';
import { useGetSecondaryFieldButton } from '@/object-record/record-field/ui/hooks/useGetSecondaryFieldButton';
import { useOpenRecordTableCellFromCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellFromCell';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowUpRight, IconPencil } from 'twenty-ui/icon';

export const RecordTableCellEditButton = () => {
  const { cellPosition } = useContext(RecordTableCellContext);
  const { openTableCell } = useOpenRecordTableCellFromCell();
  const isFieldInputOnly = useIsFieldInputOnly();
  const isFirstColumn = cellPosition.column === 0;
  const customButtonIcon = useGetButtonIcon();

  const secondaryButton = useGetSecondaryFieldButton();

  const mainButtonIcon = isFirstColumn
    ? IconArrowUpRight
    : isDefined(customButtonIcon)
      ? customButtonIcon
      : IconPencil;

  const handleMainButtonClick = () => {
    if (!isFieldInputOnly && isFirstColumn) {
      openTableCell(undefined, true);
    } else {
      openTableCell();
    }
  };

  return (
    <RecordTableCellButtons
      buttons={[
        ...secondaryButton,
        {
          onClick: handleMainButtonClick,
          Icon: mainButtonIcon,
          ariaLabel: isFirstColumn ? t`Open record` : t`Edit field`,
        },
      ]}
    />
  );
};
