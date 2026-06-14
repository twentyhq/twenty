import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useIsRecordFieldReadOnly } from '@/object-record/read-only/hooks/useIsRecordFieldReadOnly';
import { isFieldTextValue } from '@/object-record/record-field/ui/types/guards/isFieldTextValue';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { TextArea } from '@/ui/input/components/TextArea';
import { useAtomFamilySelectorState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorState';
import { styled } from '@linaria/react';
import { useCallback, useEffect } from 'react';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';
import { useDebouncedCallback } from 'use-debounce';

const StyledContainer = styled.div`
  box-sizing: border-box;
  padding: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

type FieldWidgetTextEditorProps = {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordId: string;
};

export const FieldWidgetTextEditor = ({
  fieldMetadataItem,
  objectMetadataItem,
  recordId,
}: FieldWidgetTextEditorProps) => {
  const fieldName = fieldMetadataItem.name;
  const { updateOneRecord } = useUpdateOneRecord();

  const [fieldValue, setFieldValue] = useAtomFamilySelectorState(
    recordStoreFamilySelector,
    {
      recordId,
      fieldName,
    },
  );

  const isRecordFieldReadOnly = useIsRecordFieldReadOnly({
    recordId,
    objectMetadataId: objectMetadataItem.id,
    fieldMetadataId: fieldMetadataItem.id,
  });

  const textAreaId = `field-widget-text-editor-${recordId}-${fieldName}`;

  const persistTextDebounced = useDebouncedCallback((text: string) => {
    if (isRecordFieldReadOnly === true) {
      return;
    }

    updateOneRecord({
      objectNameSingular: objectMetadataItem.nameSingular,
      idToUpdate: recordId,
      updateOneRecordInput: {
        [fieldName]: text,
      },
    });
  }, 300);

  useEffect(() => () => persistTextDebounced.flush(), [persistTextDebounced]);

  const handleChange = useCallback(
    (text: string) => {
      if (isRecordFieldReadOnly === true) {
        return;
      }

      setFieldValue(text);

      persistTextDebounced(text);
    },
    [isRecordFieldReadOnly, persistTextDebounced, setFieldValue],
  );

  const handleBlur = useCallback(() => {
    persistTextDebounced.flush();
  }, [persistTextDebounced]);

  const fieldTextValue = isFieldTextValue(fieldValue) ? fieldValue : '';

  return (
    <StyledContainer>
      <TextArea
        textAreaId={textAreaId}
        value={fieldTextValue}
        readOnly={isRecordFieldReadOnly}
        onChange={handleChange}
        onBlur={handleBlur}
        variant="transparent"
      />
    </StyledContainer>
  );
};
