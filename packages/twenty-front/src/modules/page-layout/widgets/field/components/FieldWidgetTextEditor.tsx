import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useIsRecordFieldReadOnly } from '@/object-record/read-only/hooks/useIsRecordFieldReadOnly';
import { useRecordSeededDraft } from '@/object-record/record-seeded-draft/hooks/useRecordSeededDraft';
import { isFieldTextValue } from '@/object-record/record-field/ui/types/guards/isFieldTextValue';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { TextArea } from '@/ui/input/components/TextArea';
import { useAtomFamilySelectorState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorState';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  box-sizing: border-box;
  padding: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const PERSIST_DEBOUNCE_MS = 300;

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

  const { draft, updateDraft, flush } = useRecordSeededDraft({
    upstreamDraft: { text: fieldTextValue },
    persistDebounceMs: PERSIST_DEBOUNCE_MS,
    resetKey: `${recordId}-${fieldMetadataItem.id}`,
    onPersist: ({ text }) => {
      if (isRecordFieldReadOnly === true) {
        return;
      }

      setFieldValue(text);

      updateOneRecord({
        objectNameSingular: objectMetadataItem.nameSingular,
        idToUpdate: recordId,
        updateOneRecordInput: {
          [fieldName]: text,
        },
      });
    },
  });

  const handleChange = (text: string) => {
    if (isRecordFieldReadOnly === true) {
      return;
    }

    updateDraft({ text });
    setFieldValue(text);
  };

  return (
    <StyledContainer>
      <TextArea
        textAreaId={textAreaId}
        value={draft.text}
        readOnly={isRecordFieldReadOnly}
        onChange={handleChange}
        onBlur={() => flush()}
        variant="transparent"
      />
    </StyledContainer>
  );
};
