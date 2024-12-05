import { useArrayField } from '@/object-record/record-field/meta-types/hooks/useArrayField';
import { ArrayFieldMenuItem } from '@/object-record/record-field/meta-types/input/components/ArrayFieldMenuItem';
import { MultiItemFieldInput } from '@/object-record/record-field/meta-types/input/components/MultiItemFieldInput';
import { useMemo } from 'react';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type ArrayFieldInputProps = {
  onCancel?: () => void;
  onClickOutside?: (event: MouseEvent | TouchEvent) => void;
};

export const ArrayFieldInput = ({
  onCancel,
  onClickOutside,
}: ArrayFieldInputProps) => {
  const { persistArrayField, hotkeyScope, fieldValue } = useArrayField();

  const arrayItems = useMemo<Array<string>>(
    () => (Array.isArray(fieldValue) ? fieldValue : []),
    [fieldValue],
  );

  return (
    <MultiItemFieldInput
      hotkeyScope={hotkeyScope}
      newItemLabel="Add Item"
      items={arrayItems}
      onPersist={persistArrayField}
      onCancel={onCancel}
      onClickOutside={onClickOutside}
      placeholder="Enter value"
      fieldMetadataType={FieldMetadataType.Array}
      renderItem={({ value, index, handleEdit, handleDelete }) => (
        <ArrayFieldMenuItem
          key={index}
          dropdownId={`${hotkeyScope}-array-${index}`}
          value={value}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    ></MultiItemFieldInput>
  );
};
