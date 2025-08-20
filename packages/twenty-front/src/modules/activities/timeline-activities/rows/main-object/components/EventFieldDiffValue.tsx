import styled from '@emotion/styled';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';

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
      <RecordFieldComponentInstanceContext.Provider
        value={{
          instanceId: `${diffArtificialRecordStoreId}-${fieldMetadataItem.name}`,
        }}
      >
        <FieldContext.Provider
          value={{
            recordId: diffArtificialRecordStoreId,
            isLabelIdentifier: false,
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
            isRecordFieldReadOnly: false,
          }}
        >
          <FieldDisplay />
        </FieldContext.Provider>
      </RecordFieldComponentInstanceContext.Provider>
    </StyledEventFieldDiffValue>
  );
};
