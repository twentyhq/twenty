import { useRecoilState } from 'recoil';

import {
  ViewFieldDefinition,
  ViewFieldNumberMetadata,
} from '@/ui/editable-field/types/ViewField';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateEntityField } from '@/ui/table/hooks/useUpdateEntityField';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/tableEntityFieldFamilySelector';

import { TextCellEdit } from './TextCellEdit';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldNumberMetadata>;
};

export function GenericEditableNumberCellEditMode({ viewField }: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

  // TODO: we could use a hook that would return the field value with the right type
  const [fieldValue, setFieldValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewField.metadata.fieldName,
    }),
  );

  const updateField = useUpdateEntityField();

  function handleSubmit(newText: string) {
    if (newText === fieldValue) return;

    try {
      const numberValue = parseInt(newText);

      if (isNaN(numberValue)) {
        throw new Error('Not a number');
      }

      // TODO: find a way to store this better in DB
      if (numberValue > 2000000000) {
        throw new Error('Number too big');
      }

      setFieldValue(numberValue.toString());

      if (currentRowEntityId && updateField) {
        updateField(currentRowEntityId, viewField, numberValue);
      }
    } catch (error) {
      console.warn(
        `In GenericEditableNumberCellEditMode, Invalid number: ${newText}, ${error}`,
      );
    }
  }

  return (
    <TextCellEdit autoFocus value={fieldValue ?? ''} onSubmit={handleSubmit} />
  );
}
