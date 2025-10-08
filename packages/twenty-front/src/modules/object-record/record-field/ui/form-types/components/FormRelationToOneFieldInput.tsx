import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import {
  type FieldRelationToOneValue,
  type FieldRelationValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { type JsonValue } from 'type-fest';

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
        objectNameSingulars={[objectNameSingular]}
        disabled={readonly}
        VariablePicker={VariablePicker}
      />
    )
  );
};
