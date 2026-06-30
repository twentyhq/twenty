import { useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ConfigVariableEdit } from '@/settings/config-variables/components/ConfigVariableEdit';
import { TextInput } from '@/ui/input/components/TextInput';

type VariableData = {
  id: string;
  key: string;
  value?: string | null;
  description: string;
  isFilled: boolean;
};

export const ApplicationRegistrationConfigVariableEditForm = ({
  variable,
  onUpdateVariable,
}: {
  variable: VariableData;
  onUpdateVariable: (
    id: string,
    update: { value: string; resetValue?: boolean },
  ) => Promise<void>;
}) => {
  const { t } = useLingui();

  const [value, setValue] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  const canOpenCancelModal = variable.isFilled && !isNonEmptyString(value);

  const onCancel = () => {
    setValue('');
  };

  const onSave = async () => {
    if (!isNonEmptyString(value)) {
      return;
    }

    try {
      await onUpdateVariable(variable.id, { value });
    } finally {
      setValue('');
    }
  };

  const onConfirmReset = async () => {
    try {
      await onUpdateVariable(variable.id, { value: '', resetValue: true });
    } finally {
      setValue('');
    }
  };

  return (
    <ConfigVariableEdit
      title={variable.key}
      description={variable.description}
      input={
        <TextInput
          value={value}
          placeholder={!isEditing ? (variable.value ?? t`Enter a value`) : ''}
          onChange={setValue}
          disabled={!isEditing}
          fullWidth
        />
      }
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      isSaveDisabled={!isNonEmptyString(value)}
      onSave={onSave}
      onCancel={onCancel}
      canOpenCancelModal={canOpenCancelModal}
      onConfirmReset={onConfirmReset}
    />
  );
};
