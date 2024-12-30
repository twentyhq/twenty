import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { usePhonesFieldDisplay } from '@/object-record/record-field/meta-types/hooks/usePhonesFieldDisplay';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { PhonesDisplay } from '@/ui/field/display/components/PhonesDisplay';
import React from 'react';
import { useIcons } from 'twenty-ui';

export const PhonesFieldDisplay = () => {
  const { fieldValue } = usePhonesFieldDisplay();

  const { isFocused } = useFieldFocus();

  const { enqueueSnackBar } = useSnackBar();

  const { getIcon } = useIcons();

  const IconCircleCheck = getIcon('IconCircleCheck');
  const IconExclamationCircle = getIcon('IconExclamationCircle');

  const handleClick = async (
    phoneNumber: string,
    event: React.MouseEvent<HTMLElement>,
  ) => {
    event.preventDefault();

    try {
      await navigator.clipboard.writeText(phoneNumber);
      enqueueSnackBar('Phone number copied to clipboard', {
        variant: SnackBarVariant.Success,
        icon: <IconCircleCheck size={16} color="green" />,
        duration: 2000,
      });
    } catch (err) {
      enqueueSnackBar('Error copying to clipboard', {
        variant: SnackBarVariant.Error,
        icon: <IconExclamationCircle size={16} color="red" />,
        duration: 2000,
      });
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
