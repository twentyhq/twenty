import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { isSelectableFieldPathPart } from '@/object-record/field-path-picker/utils/isSelectableFieldPathPart';
import { useFieldPathFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useFieldPathFieldDisplay';
import styled from '@emotion/styled';
import { Tag } from 'twenty-ui';

const StyledContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const FieldPathFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useFieldPathFieldDisplay();

  const { objectMetadataItems } = useFilteredObjectMetadataItems();

  const allFieldMetadataItems = objectMetadataItems
    .flatMap((objectMetadata) => objectMetadata.fields)
    .filter(isSelectableFieldPathPart);

  const fieldLabelById = new Map(
    allFieldMetadataItems.map((fieldMetadata) => [
      fieldMetadata.id,
      fieldMetadata.label,
    ]),
  );

  const fieldLabels =
    fieldValue?.map((fieldMetadataId) => fieldLabelById.get(fieldMetadataId)) ??
    [];

  if (fieldLabels.some((fieldName) => fieldName === undefined)) {
    return <div>Invalid field path</div>; // TODO: Tooltip - a field in the path has been deactivated
  }

  // TODO: Tooltip - display full field path
  return (
    <StyledContainer>
      {fieldLabels.map((fieldName) => (
        <Tag preventShrink color={'gray'} text={fieldName as string} />
      ))}
    </StyledContainer>
  );
};
