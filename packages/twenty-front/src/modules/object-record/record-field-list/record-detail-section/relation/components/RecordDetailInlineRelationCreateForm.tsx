import { styled } from '@linaria/react';

import { RecordFieldList } from '@/object-record/record-field-list/components/RecordFieldList';
import { RecordDetailRecordsListItemContainer } from '@/object-record/record-field-list/record-detail-section/components/RecordDetailRecordsListItemContainer';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Button } from 'twenty-ui/input';

const StyledInlineCreateWrapper = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border-radius: ${themeCssVariables.border.radius.sm};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledFormActions = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

type RecordDetailInlineRelationCreateFormProps = {
  newRecordId: string;
  relationObjectMetadataItem: EnrichedObjectMetadataItem;
  relationFieldMetadataItem: FieldMetadataItem;
  scopeInstanceId: string;
  onDone: () => void;
  onCancel: (newRecordId: string) => void;
};

export const RecordDetailInlineRelationCreateForm = ({
  newRecordId,
  relationObjectMetadataItem,
  relationFieldMetadataItem,
  scopeInstanceId,
  onDone,
  onCancel,
}: RecordDetailInlineRelationCreateFormProps) => {
  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: relationObjectMetadataItem.nameSingular,
  });

  const handleCancel = async () => {
    await deleteOneRecord(newRecordId);
    onCancel(newRecordId);
  };

  return (
    <StyledInlineCreateWrapper>
      <RecordDetailRecordsListItemContainer>
        <RecordChip
          record={{
            id: newRecordId,
            __typename: relationObjectMetadataItem.nameSingular,
          }}
          objectNameSingular={relationObjectMetadataItem.nameSingular}
          forceDisableClick={true}
        />
      </RecordDetailRecordsListItemContainer>
      <RecordFieldList
        instanceId={`${scopeInstanceId}-inline-create-${newRecordId}`}
        objectNameSingular={relationObjectMetadataItem.nameSingular}
        objectRecordId={newRecordId}
        showDuplicatesSection={false}
        showRelationSections={false}
        excludeCreatedAtAndUpdatedAt={true}
        excludeFieldMetadataIds={[relationFieldMetadataItem.id]}
      />
      <StyledFormActions>
        <Button
          title={t`Discard`}
          variant="secondary"
          size="small"
          onClick={handleCancel}
        />
        <Button
          title={t`Done`}
          variant="primary"
          size="small"
          onClick={onDone}
        />
      </StyledFormActions>
    </StyledInlineCreateWrapper>
  );
};
