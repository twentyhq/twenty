import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useGetButtonIcon } from '@/object-record/record-field/ui/hooks/useGetButtonIcon';
import { useIsFieldInputOnly } from '@/object-record/record-field/ui/hooks/useIsFieldInputOnly';
import {
  type FieldEmailsValue,
  type FieldLinksValue,
  type FieldPhonesValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldEmails } from '@/object-record/record-field/ui/types/guards/isFieldEmails';
import { isFieldLinks } from '@/object-record/record-field/ui/types/guards/isFieldLinks';
import { isFieldPhones } from '@/object-record/record-field/ui/types/guards/isFieldPhones';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableCellButton } from '@/object-record/record-table/record-table-cell/components/RecordTableCellButton';
import { useOpenRecordTableCellFromCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellFromCell';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowUpRight, IconCopy, IconPencil } from 'twenty-ui/display';

export const RecordTableCellEditButton = () => {
  const { cellPosition } = useContext(RecordTableCellContext);
  const { fieldDefinition, recordId } = useContext(FieldContext);
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();
  const { openTableCell } = useOpenRecordTableCellFromCell();
  const isFieldInputOnly = useIsFieldInputOnly();
  const isFirstColumn = cellPosition.column === 0;
  const customButtonIcon = useGetButtonIcon();

  const buttonIcon = isFirstColumn
    ? IconArrowUpRight
    : isDefined(customButtonIcon)
      ? customButtonIcon
      : IconPencil;

  let actionMode = null;

  if (isFieldPhones(fieldDefinition)) {
    assertFieldMetadata(
      FieldMetadataType.PHONES,
      isFieldPhones,
      fieldDefinition,
    );
    actionMode =
      (fieldDefinition.metadata.settings?.actionMode as 'copy' | 'navigate') ??
      'copy';
  } else if (isFieldEmails(fieldDefinition)) {
    assertFieldMetadata(
      FieldMetadataType.EMAILS,
      isFieldEmails,
      fieldDefinition,
    );
    actionMode =
      (fieldDefinition.metadata.settings?.actionMode as 'copy' | 'navigate') ??
      'copy';
  } else if (isFieldLinks(fieldDefinition)) {
    assertFieldMetadata(FieldMetadataType.LINKS, isFieldLinks, fieldDefinition);
    actionMode =
      (fieldDefinition.metadata.settings?.actionMode as 'copy' | 'navigate') ??
      'copy';
  }

  const fieldValue = useRecordFieldValue<
    FieldPhonesValue | FieldEmailsValue | FieldLinksValue | undefined
  >(recordId, fieldDefinition.metadata.fieldName, fieldDefinition);

  const handleButtonClick = () => {
    if (!isFieldInputOnly && isFirstColumn) {
      openTableCell(undefined, false, true);
    } else {
      openTableCell();
    }
  };

  const getFieldValueText = () => {
    if (!fieldValue) return '';
    if (isFieldPhones(fieldDefinition)) {
      const { primaryPhoneCallingCode = '', primaryPhoneNumber = '' } =
        fieldValue as FieldPhonesValue;
      return primaryPhoneCallingCode && primaryPhoneNumber
        ? `${primaryPhoneCallingCode}${primaryPhoneNumber}`
        : primaryPhoneNumber;
    }
    if (isFieldEmails(fieldDefinition))
      return (fieldValue as FieldEmailsValue).primaryEmail || '';
    if (isFieldLinks(fieldDefinition))
      return (fieldValue as FieldLinksValue).primaryLinkUrl || '';
    return '';
  };

  const handleNavigateClick = () => {
    const text = getFieldValueText();
    if (!text) return;

    const url = isFieldPhones(fieldDefinition)
      ? `tel:${text}`
      : isFieldEmails(fieldDefinition)
        ? `mailto:${text}`
        : text;

    window.open(url, '_blank');
  };

  const handleCopyClick = async () => {
    try {
      const textToCopy = getFieldValueText();
      const textMessage = isFieldPhones(fieldDefinition)
        ? t`Phone number copied to clipboard`
        : isFieldEmails(fieldDefinition)
          ? t`Email address copied to clipboard`
          : t`Link copied to clipboard`;
      if (isDefined(textToCopy)) {
        await navigator.clipboard.writeText(textToCopy);
        enqueueSuccessSnackBar({
          message: textMessage,
          options: { duration: 2000 },
        });
      }
    } catch {
      enqueueErrorSnackBar({
        message: t`Error copying to clipboard`,
        options: { duration: 2000 },
      });
    }
  };

  const isNavigatePrimary = actionMode === 'navigate';
  const secondaryClick = actionMode
    ? isNavigatePrimary
      ? handleCopyClick
      : handleNavigateClick
    : undefined;
  const secondaryIcon = actionMode
    ? isNavigatePrimary
      ? IconCopy
      : IconArrowUpRight
    : undefined;

  return (
    <RecordTableCellButton
      onClick={handleButtonClick}
      Icon={buttonIcon}
      onSecondaryClick={secondaryClick}
      SecondaryIcon={secondaryIcon}
    />
  );
};
