/* @license Enterprise */

import { FieldMetadataType, MetadataReadability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatRecordInheritanceRuleMaps } from 'src/engine/metadata-modules/flat-record-inheritance-rule/types/flat-record-inheritance-rule-maps.type';
import { findFlatRecordInheritanceRulesOfObject } from 'src/engine/metadata-modules/flat-record-inheritance-rule/utils/find-flat-record-inheritance-rules-of-object.util';
import { type InheritedReadabilityChildrenParent } from 'src/engine/core-modules/record-share/types/inherited-readability-children-parent.type';
import { type InheritedReadabilityColumnParent } from 'src/engine/core-modules/record-share/types/inherited-readability-column-parent.type';
import { type InheritedReadabilityParent } from 'src/engine/core-modules/record-share/types/inherited-readability-parent.type';
import { getRelationFlatFieldMetadatasOfObject } from 'src/engine/twenty-orm/utils/get-relation-flat-field-metadatas-of-object.util';
import { isManyToOneFlatFieldMetadata } from 'src/engine/twenty-orm/utils/is-many-to-one-flat-field-metadata.util';

type RelationFlatFieldMetadata =
  OrmFlatFieldMetadata<MorphOrRelationFieldMetadataType>;

const isOneToMany = (flatFieldMetadata: RelationFlatFieldMetadata): boolean =>
  flatFieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY;

const resolveColumnParents = ({
  relationFlatFieldMetadatas,
  declaredFlatFieldMetadatas,
  flatObjectMetadataMaps,
}: {
  relationFlatFieldMetadatas: RelationFlatFieldMetadata[];
  declaredFlatFieldMetadatas: RelationFlatFieldMetadata[];
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): InheritedReadabilityColumnParent[] => {
  const declaredManyToOneFlatFieldMetadatas = declaredFlatFieldMetadatas.filter(
    isManyToOneFlatFieldMetadata,
  );

  const declaredMorphIds = new Set(
    declaredManyToOneFlatFieldMetadatas
      .filter(
        (flatFieldMetadata) =>
          flatFieldMetadata.type === FieldMetadataType.MORPH_RELATION,
      )
      .map((flatFieldMetadata) => flatFieldMetadata.morphId)
      .filter(isDefined),
  );

  const morphSiblingFlatFieldMetadatas = relationFlatFieldMetadatas
    .filter(isManyToOneFlatFieldMetadata)
    .filter(
      (flatFieldMetadata) =>
        flatFieldMetadata.type === FieldMetadataType.MORPH_RELATION &&
        isDefined(flatFieldMetadata.morphId) &&
        declaredMorphIds.has(flatFieldMetadata.morphId),
    );

  const parentFlatFieldMetadatas = [
    ...declaredManyToOneFlatFieldMetadatas,
    ...morphSiblingFlatFieldMetadatas,
  ].filter(
    (flatFieldMetadata, index, flatFieldMetadatas) =>
      flatFieldMetadatas.findIndex(
        (candidate) => candidate.id === flatFieldMetadata.id,
      ) === index,
  );

  return parentFlatFieldMetadatas.flatMap((flatFieldMetadata) => {
    const parentFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: flatFieldMetadata.relationTargetObjectMetadataId,
    });

    if (!isDefined(parentFlatObjectMetadata)) {
      return [];
    }

    return [
      {
        kind: 'column' as const,
        fieldMetadataId: flatFieldMetadata.id,
        joinColumnName: computeMorphOrRelationFieldJoinColumnName({
          name: flatFieldMetadata.name,
        }),
        parentFlatObjectMetadata,
      },
    ];
  });
};

const resolveChildrenParents = ({
  declaredFlatFieldMetadatas,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  declaredFlatFieldMetadatas: RelationFlatFieldMetadata[];
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): InheritedReadabilityChildrenParent[] =>
  declaredFlatFieldMetadatas
    .filter(isOneToMany)
    .flatMap((flatFieldMetadata) => {
      const childFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityMaps: flatObjectMetadataMaps,
        flatEntityId: flatFieldMetadata.relationTargetObjectMetadataId,
      });
      const childFlatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityMaps: flatFieldMetadataMaps,
        flatEntityId: flatFieldMetadata.relationTargetFieldMetadataId,
      });

      if (
        !isDefined(childFlatObjectMetadata) ||
        !isDefined(childFlatFieldMetadata) ||
        !isMorphOrRelationFlatFieldMetadata(childFlatFieldMetadata) ||
        !isManyToOneFlatFieldMetadata(childFlatFieldMetadata)
      ) {
        return [];
      }

      return [
        {
          kind: 'children' as const,
          fieldMetadataId: flatFieldMetadata.id,
          childJoinColumnName: computeMorphOrRelationFieldJoinColumnName({
            name: childFlatFieldMetadata.name,
          }),
          childFlatObjectMetadata,
        },
      ];
    });

const findRelationFlatFieldMetadata = ({
  flatFieldMetadataId,
  flatFieldMetadataMaps,
}: {
  flatFieldMetadataId: string | null;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): RelationFlatFieldMetadata | undefined => {
  if (!isDefined(flatFieldMetadataId)) {
    return undefined;
  }

  const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityMaps: flatFieldMetadataMaps,
    flatEntityId: flatFieldMetadataId,
  });

  return isDefined(flatFieldMetadata) &&
    isMorphOrRelationFlatFieldMetadata(flatFieldMetadata)
    ? flatFieldMetadata
    : undefined;
};

const resolveRuleParents = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  flatRecordInheritanceRuleMaps,
}: {
  flatObjectMetadata: Pick<FlatObjectMetadata, 'id'>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatRecordInheritanceRuleMaps: FlatRecordInheritanceRuleMaps | undefined;
}): InheritedReadabilityParent[] =>
  findFlatRecordInheritanceRulesOfObject({
    objectMetadataId: flatObjectMetadata.id,
    flatRecordInheritanceRuleMaps,
  }).flatMap((flatRecordInheritanceRule): InheritedReadabilityParent[] => {
    const parentFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: flatRecordInheritanceRule.parentObjectMetadataId,
    });
    const relationFlatFieldMetadata = findRelationFlatFieldMetadata({
      flatFieldMetadataId: flatRecordInheritanceRule.fieldMetadataId,
      flatFieldMetadataMaps,
    });

    if (
      !isDefined(parentFlatObjectMetadata) ||
      !isDefined(relationFlatFieldMetadata)
    ) {
      return [];
    }

    if (!isDefined(flatRecordInheritanceRule.junctionFieldMetadataId)) {
      return isManyToOneFlatFieldMetadata(relationFlatFieldMetadata)
        ? [
            {
              kind: 'column',
              fieldMetadataId: relationFlatFieldMetadata.id,
              joinColumnName: computeMorphOrRelationFieldJoinColumnName({
                name: relationFlatFieldMetadata.name,
              }),
              parentFlatObjectMetadata,
            },
          ]
        : [];
    }

    const junctionFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: relationFlatFieldMetadata.relationTargetObjectMetadataId,
    });
    const junctionChildFlatFieldMetadata = findRelationFlatFieldMetadata({
      flatFieldMetadataId:
        relationFlatFieldMetadata.relationTargetFieldMetadataId,
      flatFieldMetadataMaps,
    });
    const junctionParentFlatFieldMetadata = findRelationFlatFieldMetadata({
      flatFieldMetadataId: flatRecordInheritanceRule.junctionFieldMetadataId,
      flatFieldMetadataMaps,
    });

    if (
      !isOneToMany(relationFlatFieldMetadata) ||
      !isDefined(junctionFlatObjectMetadata) ||
      !isDefined(junctionChildFlatFieldMetadata) ||
      !isDefined(junctionParentFlatFieldMetadata) ||
      !isManyToOneFlatFieldMetadata(junctionChildFlatFieldMetadata) ||
      !isManyToOneFlatFieldMetadata(junctionParentFlatFieldMetadata)
    ) {
      return [];
    }

    return [
      {
        kind: 'children',
        fieldMetadataId: relationFlatFieldMetadata.id,
        childJoinColumnName: computeMorphOrRelationFieldJoinColumnName({
          name: junctionChildFlatFieldMetadata.name,
        }),
        childFlatObjectMetadata: junctionFlatObjectMetadata,
        junctionParent: {
          joinColumnName: computeMorphOrRelationFieldJoinColumnName({
            name: junctionParentFlatFieldMetadata.name,
          }),
          parentFlatObjectMetadata,
        },
      },
    ];
  });

export const resolveInheritedReadabilityParents = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  flatRecordInheritanceRuleMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatRecordInheritanceRuleMaps?: FlatRecordInheritanceRuleMaps;
}): InheritedReadabilityParent[] => {
  const relationFlatFieldMetadatas = getRelationFlatFieldMetadatasOfObject({
    flatObjectMetadata,
    flatFieldMetadataMaps,
  });
  // Declared parents belong to INHERITED objects; a rule alone only brings its own
  const declaredUniversalIdentifiers =
    flatObjectMetadata.readability === MetadataReadability.INHERITED
      ? (flatObjectMetadata.readabilityParentFieldUniversalIdentifiers ?? [])
      : [];
  const declaredFlatFieldMetadatas = declaredUniversalIdentifiers.flatMap(
    (universalIdentifier) =>
      relationFlatFieldMetadatas.filter(
        (flatFieldMetadata) =>
          flatFieldMetadata.universalIdentifier === universalIdentifier,
      ),
  );

  const declaredParents = [
    ...resolveColumnParents({
      relationFlatFieldMetadatas,
      declaredFlatFieldMetadatas,
      flatObjectMetadataMaps,
    }),
    ...resolveChildrenParents({
      declaredFlatFieldMetadatas,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    }),
  ];
  const declaredColumnFieldMetadataIds = new Set(
    declaredParents
      .filter((parent) => parent.kind === 'column')
      .map((parent) => parent.fieldMetadataId),
  );

  return [
    ...declaredParents,
    ...resolveRuleParents({
      flatObjectMetadata,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      flatRecordInheritanceRuleMaps,
    }).filter(
      (parent) =>
        parent.kind !== 'column' ||
        !declaredColumnFieldMetadataIds.has(parent.fieldMetadataId),
    ),
  ];
};
