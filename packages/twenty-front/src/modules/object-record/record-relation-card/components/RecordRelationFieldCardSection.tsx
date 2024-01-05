import { useContext, useEffect, useMemo } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { FieldContext } from '@/object-record/field/contexts/FieldContext';
import { entityFieldsFamilySelector } from '@/object-record/field/states/selectors/entityFieldsFamilySelector';
import { FieldRelationMetadata } from '@/object-record/field/types/FieldMetadata';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpsertRecordFromState } from '@/object-record/hooks/useUpsertRecordFromState';
import { RecordRelationFieldCardContent } from '@/object-record/record-relation-card/components/RecordRelationFieldCardContent';
import { Card } from '@/ui/layout/card/components/Card';
import { Section } from '@/ui/layout/section/components/Section';

const StyledTitle = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(0, 1)};
`;

export const RecordRelationFieldCardSection = () => {
  const { entityId, fieldDefinition } = useContext(FieldContext);
  const {
    relationFieldMetadataId,
    relationObjectMetadataNameSingular,
    relationType,
  } = fieldDefinition.metadata as FieldRelationMetadata;

  const {
    labelIdentifierFieldMetadata: relationLabelIdentifierFieldMetadata,
    objectMetadataItem: relationObjectMetadataItem,
  } = useObjectMetadataItem({
    objectNameSingular: relationObjectMetadataNameSingular,
  });

  const relationFieldMetadataItem = relationObjectMetadataItem.fields.find(
    ({ id }) => id === relationFieldMetadataId,
  );

  const fieldValue = useRecoilValue<
    ({ id: string } & Record<string, any>) | null
  >(
    entityFieldsFamilySelector({
      entityId,
      fieldName: fieldDefinition.metadata.fieldName,
    }),
  );

  const isToOneObject = relationType === 'TO_ONE_OBJECT';

  const { record: recordFromFieldValue } = useFindOneRecord({
    objectNameSingular: relationObjectMetadataNameSingular,
    objectRecordId: fieldValue?.id,
    skip: !relationLabelIdentifierFieldMetadata || !isToOneObject,
  });

  // ONE_TO_MANY records cannot be retrieved from the field value,
  // as the record's field is an empty "Connection" object.
  // TODO: maybe the backend could return an array of related records instead?
  const { records } = useFindManyRecords({
    objectNameSingular: relationObjectMetadataNameSingular,
    limit: 5,
    filter: {
      // TODO: this won't work for MANY_TO_MANY relations.
      [`${relationFieldMetadataItem?.name}Id`]: {
        eq: entityId,
      },
    },
    skip:
      !relationLabelIdentifierFieldMetadata ||
      !relationFieldMetadataItem?.name ||
      isToOneObject,
  });

  const relationRecords = useMemo(
    () => (recordFromFieldValue ? [recordFromFieldValue] : records),
    [recordFromFieldValue, records],
  );

  const upsertRecordFromState = useUpsertRecordFromState();

  useEffect(() => {
    if (!relationRecords.length) return;

    relationRecords.forEach((relationRecord) =>
      upsertRecordFromState(relationRecord),
    );
  }, [relationRecords, upsertRecordFromState]);

  if (!relationLabelIdentifierFieldMetadata) return null;

  return (
    <Section>
      <StyledTitle>{fieldDefinition.label}</StyledTitle>
      {!!relationRecords.length && (
        <Card>
          {relationRecords.map((relationRecord, index) => (
            <RecordRelationFieldCardContent
              key={`${relationRecord.id}${relationLabelIdentifierFieldMetadata?.id}`}
              divider={index < relationRecords.length - 1}
              relationRecordId={relationRecord.id}
            />
          ))}
        </Card>
      )}
    </Section>
  );
};
