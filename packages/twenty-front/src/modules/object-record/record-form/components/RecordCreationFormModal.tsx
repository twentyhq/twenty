import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordFormFieldInputs } from '@/object-record/record-form/components/RecordFormFieldInputs';
import { useRecordFormFieldMetadataItems } from '@/object-record/record-form/hooks/useRecordFormFieldMetadataItems';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { type JsonValue } from 'type-fest';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H1Title, H1TitleFontColor } from 'twenty-ui/typography';

const StyledFooter = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[6]};
`;

type RecordCreationFormModalProps = {
  modalInstanceId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  initialDraftRecord?: Partial<ObjectRecord>;
  onSubmit: (draftRecord: Partial<ObjectRecord>) => void;
};

export const RecordCreationFormModal = ({
  modalInstanceId,
  objectMetadataItem,
  initialDraftRecord,
  onSubmit,
}: RecordCreationFormModalProps) => {
  const { t } = useLingui();
  const { closeModal } = useModal();
  const [draftRecord, setDraftRecord] = useState<Partial<ObjectRecord>>(
    initialDraftRecord ?? {},
  );

  const { recordFormFieldMetadataItems } = useRecordFormFieldMetadataItems({
    objectMetadataItem,
  });

  const handleFieldValueChange = (gqlFieldName: string, value: JsonValue) => {
    setDraftRecord((previousDraftRecord) => ({
      ...previousDraftRecord,
      [gqlFieldName]: value,
    }));
  };

  const handleFieldValueClear = (gqlFieldName: string) => {
    setDraftRecord((previousDraftRecord) => ({
      ...previousDraftRecord,
      [gqlFieldName]: null,
    }));
  };

  const handleCancelClick = () => {
    closeModal(modalInstanceId);
  };

  const handleCreateClick = () => {
    closeModal(modalInstanceId);
    onSubmit(draftRecord);
  };

  return (
    <ModalStatefulWrapper
      modalInstanceId={modalInstanceId}
      isClosable={true}
      padding="large"
      overlay="dark"
      renderInDocumentBody
      smallBorderRadius
      autoHeight
    >
      <H1Title
        title={t`New ${objectMetadataItem.labelSingular}`}
        fontColor={H1TitleFontColor.Primary}
      />
      <RecordFormFieldInputs
        objectMetadataItem={objectMetadataItem}
        fieldMetadataItems={recordFormFieldMetadataItems}
        draftRecord={draftRecord}
        onFieldValueChange={handleFieldValueChange}
        onFieldValueClear={handleFieldValueClear}
      />
      <StyledFooter>
        <Button title={t`Cancel`} onClick={handleCancelClick} />
        <Button
          title={t`Create`}
          accent="blue"
          onClick={handleCreateClick}
          dataTestId="record-creation-form-create-button"
        />
      </StyledFooter>
    </ModalStatefulWrapper>
  );
};
