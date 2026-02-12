import { atom, type Atom } from 'jotai';

import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { recordStoreFamilyStateV2 } from '@/object-record/record-store/states/recordStoreFamilyStateV2';
import { createFamilySelectorV2 } from '@/ui/utilities/state/jotai/utils/createFamilySelectorV2';
import { RelationType, type ObjectRecord } from 'twenty-shared/types';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';

const simpleFieldValueSelector = createFamilySelectorV2<
  unknown,
  { recordId: string; fieldName: string }
>({
  key: 'recordStoreSimpleFieldValue',
  get:
    ({ recordId, fieldName }) =>
    ({ get }) =>
      get(recordStoreFamilyStateV2, recordId)?.[fieldName],
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
    (
      fieldDefinition.metadata as {
        morphRelations?: Array<{
          type: string;
          sourceFieldMetadata: { name: string };
          targetObjectMetadata: {
            nameSingular: string;
            namePlural: string;
          };
        }>;
      }
    ).morphRelations ?? [];

  const derivedAtom = atom((get) => {
    const record = get(recordStoreFamilyStateV2.atomFamily(recordId));

    const morphValuesWithObjectName = morphRelations.map((morphRelation) => {
      const computedFieldName = computeMorphRelationFieldName({
        fieldName: morphRelation.sourceFieldMetadata.name,
        relationType: morphRelation.type as RelationType,
        targetObjectMetadataNameSingular:
          morphRelation.targetObjectMetadata.nameSingular,
        targetObjectMetadataNamePlural:
          morphRelation.targetObjectMetadata.namePlural,
      });

      return {
        objectNameSingular: morphRelation.targetObjectMetadata.nameSingular,
        value: record?.[computedFieldName],
      };
    });

    const relationType = morphRelations[0]?.type;

    if (relationType === RelationType.ONE_TO_MANY) {
      return morphValuesWithObjectName.map((morphValue) => ({
        ...morphValue,
        value: morphValue.value ? morphValue.value : [],
      })) as {
        objectNameSingular: string;
        value: ObjectRecord[];
      }[];
    }

    if (relationType === RelationType.MANY_TO_ONE) {
      const morphValueFiltered = morphValuesWithObjectName.filter(
        (morphValue) => isDefined(morphValue.value),
      );

      return morphValueFiltered.length > 0
        ? (morphValueFiltered[0] as {
            objectNameSingular: string;
            value: ObjectRecord;
          })
        : null;
    }

    return null;
  });

  derivedAtom.debugLabel = `recordMorphFieldValue__${cacheKey}`;
  morphAtomCache.set(cacheKey, derivedAtom);

  return derivedAtom;
};

export const recordStoreFieldValueSelectorV2 = ({
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
