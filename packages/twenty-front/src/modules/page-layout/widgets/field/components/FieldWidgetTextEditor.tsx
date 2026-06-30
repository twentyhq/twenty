import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useIsRecordFieldReadOnly } from '@/object-record/read-only/hooks/useIsRecordFieldReadOnly';
import { isFieldTextValue } from '@/object-record/record-field/ui/types/guards/isFieldTextValue';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { TextArea } from '@/ui/input/components/TextArea';
import { useAtomFamilySelectorState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorState';
import { styled } from '@linaria/react';
import { useCallback, useEffect, useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
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
  const fieldTextValue = isFieldTextValue(fieldValue) ? fieldValue : '';

  const [draftText, setDraftText] = useState(fieldTextValue);
  const [isFocused, setIsFocused] = useState(false);
  const [isDraftDirty, setIsDraftDirty] = useState(false);

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

  useEffect(() => {
    if (isFocused) {
      return;
    }

    setDraftText(fieldTextValue);
    setIsDraftDirty(false);
  }, [fieldTextValue, isFocused]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setIsDraftDirty(false);
  }, []);

  const handleChange = useCallback(
    (text: string) => {
      if (isRecordFieldReadOnly === true) {
        return;
      }

      setDraftText(text);
      setIsDraftDirty(true);
      setFieldValue(text);

      persistTextDebounced(text);
    },
    [isRecordFieldReadOnly, persistTextDebounced, setFieldValue],
  );

  const handleBlur = useCallback(() => {
    setIsFocused(false);

    if (isDraftDirty && isRecordFieldReadOnly !== true) {
      setFieldValue(draftText);
    }

    persistTextDebounced.flush();
  }, [
    draftText,
    isDraftDirty,
    isRecordFieldReadOnly,
    persistTextDebounced,
    setFieldValue,
  ]);

  return (
    <StyledContainer>
      <TextArea
        textAreaId={textAreaId}
        value={draftText}
        readOnly={isRecordFieldReadOnly}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        variant="transparent"
      />
    </StyledContainer>
  );
};
