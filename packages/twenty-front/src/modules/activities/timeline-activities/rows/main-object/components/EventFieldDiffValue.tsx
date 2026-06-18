import { styled } from '@linaria/react';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type EventFieldDiffValueProps = {
  diffArtificialRecordStoreId: string;
  mainObjectMetadataItem: EnrichedObjectMetadataItem;
  fieldMetadataItem: FieldMetadataItem;
};

const StyledEventFieldDiffValue = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
