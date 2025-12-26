import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import {
  type FieldEmailsValue,
  type FieldLinksValue,
  type FieldPhonesValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldEmails } from '@/object-record/record-field/ui/types/guards/isFieldEmails';
import { isFieldLinks } from '@/object-record/record-field/ui/types/guards/isFieldLinks';
import { isFieldPhones } from '@/object-record/record-field/ui/types/guards/isFieldPhones';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { FieldMetadataSettingsOnClickAction } from 'twenty-shared/types';
import { getAbsoluteUrl, isDefined } from 'twenty-shared/utils';
import { IconArrowUpRight, IconCopy } from 'twenty-ui/display';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

export const useGetSecondaryRecordTableCellButton = () => {
  const { fieldDefinition, recordId } = useContext(FieldContext);
  const { copyToClipboard } = useCopyToClipboard();

  const fieldValue = useRecordFieldValue<
    FieldPhonesValue | FieldEmailsValue | FieldLinksValue | undefined
  >(recordId, fieldDefinition.metadata.fieldName, fieldDefinition);

  if (
    (!isFieldPhones(fieldDefinition) &&
      !isFieldLinks(fieldDefinition) &&
      !isFieldEmails(fieldDefinition)) ||
    !isDefined(fieldValue)
  ) {
    return [];
  }

  const mainActionOnClick =
    fieldDefinition.metadata.settings?.clickAction ??
    FieldMetadataSettingsOnClickAction.OPEN_LINK;

  const secondaryActionOnClick =
    mainActionOnClick === FieldMetadataSettingsOnClickAction.OPEN_LINK
      ? FieldMetadataSettingsOnClickAction.COPY
      : FieldMetadataSettingsOnClickAction.OPEN_LINK;

  let openLinkOnClick: () => void = () => {};
  let copyOnClick: () => void = () => {};

  if (isFieldPhones(fieldDefinition)) {
    const { primaryPhoneCallingCode = '', primaryPhoneNumber = '' } =
      fieldValue as FieldPhonesValue;
    const phoneNumber = `${primaryPhoneCallingCode}${primaryPhoneNumber}`;
    openLinkOnClick = () => {
      window.open(`tel:${phoneNumber}`, '_blank');
    };
    copyOnClick = () => {
      copyToClipboard(phoneNumber, t`Phone number copied to clipboard`);
    };
  }

  if (isFieldEmails(fieldDefinition)) {
    const email = (fieldValue as FieldEmailsValue).primaryEmail ?? '';
    openLinkOnClick = () => {
      window.open(`mailto:${email}`, '_blank');
    };
    copyOnClick = () => {
      copyToClipboard(email, t`Email copied to clipboard`);
    };
  }

  if (isFieldLinks(fieldDefinition)) {
    const url = (fieldValue as FieldLinksValue).primaryLinkUrl ?? '';
    openLinkOnClick = () => {
      window.open(getAbsoluteUrl(url), '_blank');
    };
    copyOnClick = () => {
      copyToClipboard(url, t`Link copied to clipboard`);
    };
  }

  return [
    {
      onClick:
        secondaryActionOnClick === FieldMetadataSettingsOnClickAction.OPEN_LINK
          ? openLinkOnClick
          : copyOnClick,
      Icon:
        secondaryActionOnClick === FieldMetadataSettingsOnClickAction.OPEN_LINK
          ? IconArrowUpRight
          : IconCopy,
    },
  ];
};
