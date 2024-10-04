import styled from '@emotion/styled';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { FieldDisplay } from '@/object-record/record-field/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';

type EventFieldDiffValueProps = {
  diffArtificialRecordStoreId: string;
  mainObjectMetadataItem: ObjectMetadataItem;
  fieldMetadataItem: FieldMetadataItem;
};

const StyledEventFieldDiffValue = styled.div`
  align-items: center;
  display: flex;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ theme }) => theme.font.color.primary};
`;

export const EventFieldDiffValue = ({
  diffArtificialRecordStoreId,
  mainObjectMetadataItem,
  fieldMetadataItem,
}: EventFieldDiffValueProps) => {
  return (
    <StyledEventFieldDiffValue>
      <FieldContext.Provider
        value={{
          recordId: diffArtificialRecordStoreId,
          isLabelIdentifier: isLabelIdentifierField({
            fieldMetadataItem,
            objectMetadataItem: mainObjectMetadataItem,
          }),
          fieldDefinition: {
            type: fieldMetadataItem.type,
            iconName: fieldMetadataItem?.icon || 'FieldIcon',
            fieldMetadataId: fieldMetadataItem.id || '',
            label: fieldMetadataItem.label,
            metadata: {
              fieldName: fieldMetadataItem.name,
              objectMetadataNameSingular: mainObjectMetadataItem.nameSingular,
              options: fieldMetadataItem.options ?? [],
            },
            defaultValue: fieldMetadataItem.defaultValue,
          },
          hotkeyScope: 'field-event-diff',
        }}
      >
        <FieldDisplay />
      </FieldContext.Provider>
    </StyledEventFieldDiffValue>
  );
};
