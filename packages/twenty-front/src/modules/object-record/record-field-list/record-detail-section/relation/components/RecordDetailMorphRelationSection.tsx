import { useContext } from 'react';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { RecordDetailSectionContainer } from '@/object-record/record-field-list/record-detail-section/components/RecordDetailSectionContainer';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import {
  FieldInputEventContext,
  type FieldInputEvent,
} from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { usePersistField } from '@/object-record/record-field/ui/hooks/usePersistField';
import { type FieldMorphRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getRecordFieldCardRelationPickerDropdownId } from '@/object-record/record-show/utils/getRecordFieldCardRelationPickerDropdownId';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { RecordDetailMorphRelationRecordsList } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailMorphRelationRecordsList';
import { RecordDetailMorphRelationSectionDropdown } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailMorphRelationSectionDropdown';
import { recordStoreMorphOneToManyValueWithObjectNameFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreMorphOneToManyValueWithObjectNameFamilySelector';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilValue } from 'recoil';
import { RelationType } from '~/generated-metadata/graphql';

type RecordDetailMorphRelationSectionProps = {
  loading: boolean;
};

export const RecordDetailMorphRelationSection = ({
  loading,
}: RecordDetailMorphRelationSectionProps) => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const metadata = fieldDefinition.metadata as FieldMorphRelationMetadata;
  const { objectMetadataNameSingular } = metadata;
  const relationType = metadata.morphRelations[0].type;

  const isMobile = useIsMobile();

  const morphRelationObjectNameSingularWithValues = useRecoilValue(
    recordStoreMorphOneToManyValueWithObjectNameFamilySelector({
      recordId,
      morphRelations: metadata.morphRelations,
    }),
  );

  const morphRelationObjectNameSingularWithValuesArray =
    morphRelationObjectNameSingularWithValues.map(
      (recordWithObjectNameSingular) => {
        const newRecordWithObjectNameSingular = {
          ...recordWithObjectNameSingular,
          value:
            relationType === RelationType.MANY_TO_ONE
              ? [recordWithObjectNameSingular.value as ObjectRecord]
              : ((recordWithObjectNameSingular.value as ObjectRecord[]) ?? []),
        };
        return newRecordWithObjectNameSingular;
      },
    );

  const recordsWithObjectNameSingular =
    morphRelationObjectNameSingularWithValuesArray.flatMap(
      (recordWithObjectNameSingular) => {
        const fieldMetadataId = metadata.morphRelations.find(
          (morphRelation) =>
            morphRelation.targetObjectMetadata.nameSingular ===
            recordWithObjectNameSingular.objectNameSingular,
        )?.targetFieldMetadata.id;
        if (!fieldMetadataId) {
          return [];
        }

        return recordWithObjectNameSingular.value.map((value) => ({
          objectNameSingular: recordWithObjectNameSingular.objectNameSingular,
          value: value,
          fieldMetadataId,
        }));
      },
    );

  const relationRecordsCount =
    morphRelationObjectNameSingularWithValuesArray.flatMap(
      (recordWithObjectNameSingular) => recordWithObjectNameSingular.value,
    ).length;

  const dropdownId = getRecordFieldCardRelationPickerDropdownId({
    fieldDefinition,
    recordId,
  });

  const isDropdownOpen = useRecoilComponentValue(
    isDropdownOpenComponentState,
    dropdownId,
  );

  // TODO: refactor this when we have refactored columnDefinitions and field definitions because
  //    we should be able to get the objectMetadataItem from a context way more easily
  const { objectMetadataItems } = useObjectMetadataItems();

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItemToFind) =>
      objectMetadataItemToFind.nameSingular === objectMetadataNameSingular,
  );

  const persistField = usePersistField({
    objectMetadataItemId: objectMetadataItem?.id ?? '',
  });

  const handleSubmit: FieldInputEvent = ({ newValue }) => {
    persistField({
      recordId: recordId,
      fieldDefinition,
      valueToPersist: newValue,
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
          <RecordDetailMorphRelationRecordsList
            recordsWithObjectNameSingular={recordsWithObjectNameSingular}
          />
        )}
      </RecordDetailSectionContainer>
    </FieldInputEventContext.Provider>
  );
};
