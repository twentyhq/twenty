import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { usePhonesFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/usePhonesFieldDisplay';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { PhonesDisplay } from '@/ui/field/display/components/PhonesDisplay';
import { useLingui } from '@lingui/react/macro';
import React from 'react';
import {
  FieldClickAction,
  type FieldMetadataMultiItemSettings,
} from 'twenty-shared/types';
import { useIcons } from 'twenty-ui/display';

export const PhonesFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = usePhonesFieldDisplay();

  const { isFocused } = useFieldFocus();

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const { getIcon } = useIcons();

  const { t } = useLingui();

  const IconCircleCheck = getIcon('IconCircleCheck');
  const IconExclamationCircle = getIcon('IconExclamationCircle');

  const settings = fieldDefinition.metadata
    .settings as FieldMetadataMultiItemSettings | null;
  const clickAction = settings?.clickAction ?? FieldClickAction.COPY;

  const handleClick = async (
    phoneNumber: string,
    event: React.MouseEvent<HTMLElement>,
  ) => {
    if (clickAction === FieldClickAction.COPY) {
      event.preventDefault();

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
    }
  };

  return (
    <PhonesDisplay
      value={fieldValue}
      isFocused={isFocused}
      onPhoneNumberClick={handleClick}
      clickAction={clickAction}
    />
  );
};
