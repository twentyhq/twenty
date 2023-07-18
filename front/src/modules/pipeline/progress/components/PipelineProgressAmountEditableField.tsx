import { useEffect, useState } from 'react';

import { EditableField } from '@/ui/editable-field/components/EditableField';
import { FieldContext } from '@/ui/editable-field/states/FieldContext';
import { IconCurrencyDollar } from '@/ui/icon';
import { InplaceInputText } from '@/ui/inplace-input/components/InplaceInputText';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';
import {
  PipelineProgress,
  useUpdateOnePipelineProgressMutation,
} from '~/generated/graphql';

type OwnProps = {
  progress: Pick<PipelineProgress, 'id' | 'amount'>;
};

export function PipelineProgressAmountEditableField({ progress }: OwnProps) {
  const [internalValue, setInternalValue] = useState(
    progress.amount?.toString(),
  );

  const [updateOnePipelineProgress] = useUpdateOnePipelineProgressMutation();

  useEffect(() => {
    setInternalValue(progress.amount?.toString());
  }, [progress.amount]);

  async function handleChange(newValue: string) {
    setInternalValue(newValue);
  }

  async function handleSubmit() {
    if (!internalValue) return;

    try {
      const numberValue = parseInt(internalValue);

      if (isNaN(numberValue)) {
        throw new Error('Not a number');
      }

      await updateOnePipelineProgress({
        variables: {
          id: progress.id,
          amount: numberValue,
        },
      });

      setInternalValue(numberValue.toString());
    } catch {
      handleCancel();
    }
  }

  async function handleCancel() {
    setInternalValue(progress.amount?.toString());
  }

  return (
    <RecoilScope SpecificContext={FieldContext}>
      <EditableField
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        iconLabel={<IconCurrencyDollar />}
        editModeContent={
          <InplaceInputText
            placeholder={'Amount'}
            autoFocus
            value={internalValue ?? ''}
            onChange={(newValue: string) => {
              handleChange(newValue);
            }}
          />
        }
        displayModeContent={internalValue}
      />
    </RecoilScope>
  );
}
