import { FormSingleRecordPicker } from '@/object-record/record-field/form-types/components/FormSingleRecordPicker';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import {
  FieldRelationToOneValue,
  FieldRelationValue,
} from '@/object-record/record-field/types/FieldMetadata';
import { isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { JsonValue } from 'type-fest';

export type FormRelationToOneFieldInputProps = {
  label?: string;
  objectNameSingular?: string;
  defaultValue?: FieldRelationValue<FieldRelationToOneValue> | string;
  onChange: (value: JsonValue) => void;
  readonly?: boolean;
  VariablePicker?: VariablePickerComponent;
};

const isFieldRelationToOneValue = (
  value: FormRelationToOneFieldInputProps['defaultValue'],
): value is FieldRelationValue<FieldRelationToOneValue> => {
  return isObject(value) && isDefined(value?.id);
};

export const FormRelationToOneFieldInput = ({
  label,
  objectNameSingular,
  onChange,
  defaultValue,
  readonly,
  VariablePicker,
}: FormRelationToOneFieldInputProps) => {
  return (
    isDefined(objectNameSingular) && (
      <FormSingleRecordPicker
        label={label}
        defaultValue={
          isFieldRelationToOneValue(defaultValue)
            ? defaultValue?.id
            : defaultValue
        }
        onChange={onChange}
        objectNameSingular={objectNameSingular}
        disabled={readonly}
        VariablePicker={VariablePicker}
      />
    )
  );
};
