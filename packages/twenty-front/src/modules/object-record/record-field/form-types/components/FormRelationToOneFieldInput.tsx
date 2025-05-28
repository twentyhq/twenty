import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { FormSingleRecordPicker } from '@/object-record/record-field/form-types/components/FormSingleRecordPicker';
import { isDefined } from 'twenty-shared/utils';
import { JsonValue } from 'type-fest';
import {
  FieldRelationToOneValue,
  FieldRelationValue,
} from '@/object-record/record-field/types/FieldMetadata';

export type FormRelationToOneFieldInputProps = {
  label?: string;
  objectNameSingular?: string;
  defaultValue: FieldRelationValue<FieldRelationToOneValue>;
  onChange: (value: JsonValue) => void;
  readonly?: boolean;
  VariablePicker?: VariablePickerComponent;
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
        defaultValue={defaultValue?.id}
        onChange={(recordId) => {
          onChange({
            id: recordId,
          });
        }}
        objectNameSingular={objectNameSingular}
        disabled={readonly}
        VariablePicker={VariablePicker}
      />
    )
  );
};
