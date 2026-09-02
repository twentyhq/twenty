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

export const RECORD_CREATION_FORM_MODAL_ID = 'record-creation-form-modal';

const StyledFooter = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[6]};
`;

type RecordCreationFormModalProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  onSubmit: (draftRecord: Partial<ObjectRecord>) => void;
};

export const RecordCreationFormModal = ({
  objectMetadataItem,
  onSubmit,
}: RecordCreationFormModalProps) => {
  const { t } = useLingui();
  const { closeModal } = useModal();
  const [draftRecord, setDraftRecord] = useState<Partial<ObjectRecord>>({});

  const { recordFormFieldMetadataItems } = useRecordFormFieldMetadataItems({
    objectMetadataItem,
  });

  const handleFieldValueChange = (gqlFieldName: string, value: JsonValue) => {
    setDraftRecord((previousDraftRecord) => ({
      ...previousDraftRecord,
      [gqlFieldName]: value,
    }));
  };

  const handleCancelClick = () => {
    closeModal(RECORD_CREATION_FORM_MODAL_ID);
  };

  const handleCreateClick = () => {
    closeModal(RECORD_CREATION_FORM_MODAL_ID);
    onSubmit(draftRecord);
  };

  return (
    <ModalStatefulWrapper
      modalInstanceId={RECORD_CREATION_FORM_MODAL_ID}
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
