import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode, useId } from 'react';
import { Field } from 'twenty-ui/primitives/input';

type RecordFormMultiItemFieldInputContainerProps = {
  label?: string;
  children: ReactNode;
};

export const RecordFormMultiItemFieldInputContainer = ({
  label,
  children,
}: RecordFormMultiItemFieldInputContainerProps) => {
  const instanceId = useId();

  return (
    <FormFieldInputContainer>
      {isNonEmptyString(label) ? <Field.Label>{label}</Field.Label> : null}
      <RecordFieldComponentInstanceContext.Provider value={{ instanceId }}>
        {children}
      </RecordFieldComponentInstanceContext.Provider>
    </FormFieldInputContainer>
  );
};
