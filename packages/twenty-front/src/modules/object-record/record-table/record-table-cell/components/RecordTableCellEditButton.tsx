import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useGetButtonIcon } from '@/object-record/record-field/ui/hooks/useGetButtonIcon';
import { useIsFieldInputOnly } from '@/object-record/record-field/ui/hooks/useIsFieldInputOnly';
import {
  type FieldEmailsValue,
  type FieldLinksValue,
  type FieldPhonesValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
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
import { isDefined } from 'twenty-shared/utils';
import { IconArrowUpRight, IconCopy, IconPencil } from 'twenty-ui/display';
import { FieldMetadataSettingsOnClickAction } from 'twenty-shared/types';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

export const RecordTableCellEditButton = () => {
  const { cellPosition } = useContext(RecordTableCellContext);
  const { fieldDefinition, recordId } = useContext(FieldContext);
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();
  const { openTableCell } = useOpenRecordTableCellFromCell();
  const isFieldInputOnly = useIsFieldInputOnly();
  const isFirstColumn = cellPosition.column === 0;
  const customButtonIcon = useGetButtonIcon();
  const { copyToClipboard } = useCopyToClipboard();

  const buttonIcon = isFirstColumn
    ? IconArrowUpRight
    : isDefined(customButtonIcon)
      ? customButtonIcon
      : IconPencil;

  let onClickAction: FieldMetadataSettingsOnClickAction | undefined;

  if (
    isFieldPhones(fieldDefinition) ||
    isFieldLinks(fieldDefinition) ||
    isFieldEmails(fieldDefinition)
  ) {
    onClickAction = fieldDefinition.metadata.settings?.clickAction;
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
      return (fieldValue as FieldEmailsValue).primaryEmail ?? '';

    if (isFieldLinks(fieldDefinition))
      return (fieldValue as FieldLinksValue).primaryLinkUrl ?? '';

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
    const textToCopy = getFieldValueText();
    const textMessage = isFieldPhones(fieldDefinition)
      ? t`Phone number copied to clipboard`
      : isFieldEmails(fieldDefinition)
        ? t`Email address copied to clipboard`
        : t`Link copied to clipboard`;
    if (textToCopy) {
      await copyToClipboard(textToCopy, textMessage);
    }
  };

  const isNavigatePrimaryForField =
    onClickAction === FieldMetadataSettingsOnClickAction.OPEN_LINK;

  const secondaryClickForField = onClickAction
    ? isNavigatePrimaryForField
      ? handleCopyClick
      : handleNavigateClick
    : undefined;

  const secondaryIcon = onClickAction
    ? isNavigatePrimaryForField
      ? IconCopy
      : IconArrowUpRight
    : undefined;

  return (
    <RecordTableCellButton
      onClick={handleButtonClick}
      Icon={buttonIcon}
      onSecondaryClick={secondaryClickForField}
      SecondaryIcon={secondaryIcon}
    />
  );
};
