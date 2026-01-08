import { useContext } from 'react';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useRecordFieldsScopeContextOrThrow } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { RecordDetailSectionContainer } from '@/object-record/record-field-list/record-detail-section/components/RecordDetailSectionContainer';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import {
  FieldInputEventContext,
  type FieldInputEvent,
} from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { type FieldMorphRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getRecordFieldCardRelationPickerDropdownId } from '@/object-record/record-show/utils/getRecordFieldCardRelationPickerDropdownId';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { RecordDetailMorphRelationSectionDropdown } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailMorphRelationSectionDropdown';
import { RecordDetailRelationRecordsList } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationRecordsList';
import { useGetMorphRelationRelatedRecordsWithObjectNameSingular } from '@/object-record/record-field-list/record-detail-section/relation/components/hooks/useGetMorphRelationRelatedRecordsWithObjectNameSingular';
import { useMorphPersistManyToOne } from '@/object-record/record-field/ui/meta-types/input/hooks/useMorphPersistManyToOne';
import { CustomError, isDefined } from 'twenty-shared/utils';

type RecordDetailMorphRelationSectionProps = {
  loading: boolean;
};

export const RecordDetailMorphRelationSection = ({
  loading,
}: RecordDetailMorphRelationSectionProps) => {
  const { scopeInstanceId } = useRecordFieldsScopeContextOrThrow();
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const metadata = fieldDefinition.metadata as FieldMorphRelationMetadata;
  const { objectMetadataNameSingular } = metadata;

  const isMobile = useIsMobile();

  const recordsWithObjectNameSingular =
    useGetMorphRelationRelatedRecordsWithObjectNameSingular({
      recordId,
      morphRelations: metadata.morphRelations,
    });

  const relationRecordsCount = recordsWithObjectNameSingular.length;

  const dropdownId = getRecordFieldCardRelationPickerDropdownId({
    fieldDefinition,
    recordId,
    instanceId: scopeInstanceId,
  });

  const isDropdownOpen = useRecoilComponentValue(
    isDropdownOpenComponentState,
    dropdownId,
  );

  const { objectMetadataItems } = useObjectMetadataItems();

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItemToFind) =>
      objectMetadataItemToFind.nameSingular === objectMetadataNameSingular,
  );

  if (!objectMetadataItem) {
    throw new CustomError(
      'Object metadata item not found',
      'OBJECT_METADATA_ITEM_NOT_FOUND',
    );
  }

  const { persistMorphManyToOne } = useMorphPersistManyToOne({
    objectMetadataNameSingular: objectMetadataItem.nameSingular,
  });

  const handleSubmit: FieldInputEvent = ({ newValue }) => {
    if (!isDefined(newValue)) {
      throw new CustomError(
        'Value to persist is required',
        'VALUE_TO_PERSIST_IS_REQUIRED',
      );
    }

    const { id, objectMetadataId } = newValue as {
      id: string;
      objectMetadataId: string;
    };

    if (!isDefined(id)) {
      throw new CustomError('Id is required', 'ID_IS_REQUIRED');
    }
    const targetObjectMetadataNameSingular = objectMetadataItems.find(
      (objectMetadataItem) => objectMetadataItem.id === objectMetadataId,
    )?.nameSingular;

    if (!isDefined(targetObjectMetadataNameSingular)) {
      throw new CustomError(
        'Target object metadata name singular is required',
        'TARGET_OBJECT_METADATA_NAME_SINGULAR_IS_REQUIRED',
      );
    }

    persistMorphManyToOne({
      recordId,
      fieldDefinition,
      valueToPersist: id,
      targetObjectMetadataNameSingular,
    });
  };

  if (loading) return null;

  return (
    <FieldInputEventContext.Provider
      value={{
        onSubmit: handleSubmit,
      }}
    >
      <RecordDetailSectionContainer
        title={fieldDefinition.label}
        hideRightAdornmentOnMouseLeave={!isDropdownOpen && !isMobile}
        areRecordsAvailable={relationRecordsCount > 0}
        rightAdornment={
          <RecordDetailMorphRelationSectionDropdown loading={loading} />
        }
      >
        {relationRecordsCount > 0 && (
          <RecordDetailRelationRecordsList
            recordsWithObjectNameSingular={recordsWithObjectNameSingular}
          />
        )}
      </RecordDetailSectionContainer>
    </FieldInputEventContext.Provider>
  );
};
