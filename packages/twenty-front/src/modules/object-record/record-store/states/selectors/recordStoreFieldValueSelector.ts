import { atom, type Atom } from 'jotai';

import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldMetadata,
  type FieldMorphRelationManyToOneValue,
  type FieldMorphRelationMetadata,
  type FieldMorphRelationOneToManyValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { RelationType } from 'twenty-shared/types';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';

const simpleFieldValueSelector = createAtomFamilySelector<
  unknown,
  { recordId: string; fieldName: string }
>({
  key: 'recordStoreSimpleFieldValue',
  get:
    ({ recordId, fieldName }) =>
    ({ get }) =>
      get(recordStoreFamilyState, recordId)?.[fieldName],
});

const morphAtomCache = new Map<string, Atom<unknown>>();

const getMorphRelationFieldValueAtom = (
  recordId: string,
  fieldName: string,
  fieldDefinition: Pick<FieldDefinition<FieldMetadata>, 'type' | 'metadata'>,
): Atom<unknown> => {
  const cacheKey = `morph__${recordId}__${fieldName}`;
  const existing = morphAtomCache.get(cacheKey);

  if (existing !== undefined) {
    return existing;
  }

  const morphRelations =
    (fieldDefinition.metadata as FieldMorphRelationMetadata).morphRelations ??
    [];

  const relationType = morphRelations[0]?.type;

  const derivedAtom = atom((get) => {
    const recordStore = get(recordStoreFamilyState.atomFamily(recordId));

    const computeMorphFieldName = (morphRelation: FieldMetadataItemRelation) =>
      computeMorphRelationFieldName({
        fieldName: morphRelation.sourceFieldMetadata.name,
        relationType: morphRelation.type,
        targetObjectMetadataNameSingular:
          morphRelation.targetObjectMetadata.nameSingular,
        targetObjectMetadataNamePlural:
          morphRelation.targetObjectMetadata.namePlural,
      });

    if (relationType === RelationType.ONE_TO_MANY) {
      return morphRelations.map((morphRelation) => ({
        objectNameSingular: morphRelation.targetObjectMetadata.nameSingular,
        objectNamePlural: morphRelation.targetObjectMetadata.namePlural,
        value: recordStore?.[computeMorphFieldName(morphRelation)] ?? [],
      })) as FieldMorphRelationOneToManyValue;
    }

    if (relationType === RelationType.MANY_TO_ONE) {
      const morphValuesWithObjectName = morphRelations.map((morphRelation) => {
        const computedFieldName = computeMorphFieldName(morphRelation);

        return {
          objectNameSingular: morphRelation.targetObjectMetadata.nameSingular,
          objectNamePlural: morphRelation.targetObjectMetadata.namePlural,
          value: recordStore?.[computedFieldName],
          foreignKeyFieldValue: recordStore?.[`${computedFieldName}Id`],
        };
      });

      const morphValueWithRelationOrForeignKey = morphValuesWithObjectName.find(
        (morphValue) => isDefined(morphValue.foreignKeyFieldValue),
      );

      if (isDefined(morphValueWithRelationOrForeignKey)) {
        return morphValueWithRelationOrForeignKey as FieldMorphRelationManyToOneValue;
      }

      return null;
    }

    return null;
  });

  derivedAtom.debugLabel = `recordMorphFieldValue__${cacheKey}`;
  morphAtomCache.set(cacheKey, derivedAtom);

  return derivedAtom;
};

export const recordStoreFieldValueSelector = ({
  recordId,
  fieldName,
  fieldDefinition,
}: {
  recordId: string;
  fieldName: string;
  fieldDefinition: Pick<FieldDefinition<FieldMetadata>, 'type' | 'metadata'>;
}): Atom<unknown> => {
  if (isFieldMorphRelation(fieldDefinition)) {
    return getMorphRelationFieldValueAtom(recordId, fieldName, fieldDefinition);
  }

  return simpleFieldValueSelector.selectorFamily({ recordId, fieldName });
};
