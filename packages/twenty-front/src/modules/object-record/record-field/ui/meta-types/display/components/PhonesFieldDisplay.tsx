import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { usePhonesFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/usePhonesFieldDisplay';
import { isFieldPhones } from '@/object-record/record-field/ui/types/guards/isFieldPhones';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { PhonesDisplay } from '@/ui/field/display/components/PhonesDisplay';
import { useLingui } from '@lingui/react/macro';
import React from 'react';
import { useIcons } from 'twenty-ui/display';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { FieldMetadataType } from 'twenty-shared/types';

export const PhonesFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = usePhonesFieldDisplay();

  assertFieldMetadata(FieldMetadataType.PHONES, isFieldPhones, fieldDefinition);
  const { isFocused } = useFieldFocus();

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const { getIcon } = useIcons();

  const { t } = useLingui();

  const IconCircleCheck = getIcon('IconCircleCheck');
  const IconExclamationCircle = getIcon('IconExclamationCircle');
  const actionMode =
    (fieldDefinition.metadata.settings?.actionMode as 'copy' | 'navigate') ??
    'copy';

  const handleClick = async (
    phoneNumber: string,
    event: React.MouseEvent<HTMLElement>,
  ) => {
    event.preventDefault();

    if (actionMode === 'copy') {
      try {
        await navigator.clipboard.writeText(phoneNumber);
        enqueueSuccessSnackBar({
          message: t`Phone number copied to clipboard`,
          options: {
            icon: <IconCircleCheck size={16} color="green" />,
            duration: 2000,
          },
        });
      } catch {
        enqueueErrorSnackBar({
          message: t`Error copying to clipboard`,
          options: {
            icon: <IconExclamationCircle size={16} color="red" />,
            duration: 2000,
          },
        });
      }
    } else if (actionMode === 'navigate') {
      window.open(`tel:${phoneNumber}`, '_blank');
    }
  };

  return (
    <PhonesDisplay
      value={fieldValue}
      isFocused={isFocused}
      onPhoneNumberClick={handleClick}
    />
  );
};
