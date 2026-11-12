import { isArray, isNonEmptyString, isString } from '@sniptt/guards';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { capitalize, isDefined, isPlainObject } from 'twenty-shared/utils';

import { ALL_MANY_TO_ONE_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant';
import { ALL_JSONB_PROPERTIES_WITH_SERIALIZED_RELATION_BY_METADATA_NAME } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/constants/all-jsonb-properties-with-serialized-relation-by-metadata-name.constant';

type AnnotatableAction = {
  type: string;
  metadataName: AllMetadataName;
  universalIdentifier?: string;
  flatEntity?: Record<string, unknown>;
};

type ManyToOneRelation = {
  universalForeignKey: string;
  isNullable: boolean;
};

export type CascadeAnnotatedAction<TAction extends AnnotatableAction> =
  TAction & { cascadedFromUniversalIdentifier?: string };

const getManyToOneRelations = (metadataName: AllMetadataName) =>
  Object.values(
    (ALL_MANY_TO_ONE_METADATA_RELATIONS[metadataName] ?? {}) as Record<
      string,
      ManyToOneRelation | null
    >,
  ).filter(isDefined);

const collectNestedStrings = (value: unknown): string[] => {
  if (isString(value)) {
    return [value];
  }

  if (isArray(value)) {
    return value.flatMap(collectNestedStrings);
  }

  return isPlainObject(value)
    ? Object.values(value).flatMap(collectNestedStrings)
    : [];
};

const getIndexFieldReferences = (flatEntity: Record<string, unknown>) => {
  const indexFields = flatEntity.universalFlatIndexFieldMetadatas;

  return isArray(indexFields)
    ? indexFields
        .filter(isPlainObject)
        .map((indexField) => indexField.fieldMetadataUniversalIdentifier)
    : [];
};

const getSerializedRelationReferences = ({
  metadataName,
  flatEntity,
}: {
  metadataName: AllMetadataName;
  flatEntity: Record<string, unknown>;
}) =>
  Object.values(
    (ALL_JSONB_PROPERTIES_WITH_SERIALIZED_RELATION_BY_METADATA_NAME[
      metadataName
    ] ?? {}) as Record<string, string>,
  ).flatMap((property) =>
    collectNestedStrings(flatEntity[`universal${capitalize(property)}`]),
  );

// Declared entities follow non-null foreign keys only; server-generated ones follow every reference.
const getParentReferences = (action: AnnotatableAction) => {
  const flatEntity = action.flatEntity ?? {};
  const relations = getManyToOneRelations(action.metadataName);
  const requiredReferences = [
    ...relations
      .filter((relation) => !relation.isNullable)
      .map((relation) => flatEntity[relation.universalForeignKey]),
    ...getIndexFieldReferences(flatEntity),
  ];

  if (flatEntity.isSystemSideEffect !== true) {
    return requiredReferences.filter(isNonEmptyString);
  }

  return [
    ...requiredReferences,
    ...relations
      .filter((relation) => relation.isNullable)
      .map((relation) => flatEntity[relation.universalForeignKey]),
    ...getSerializedRelationReferences({
      metadataName: action.metadataName,
      flatEntity,
    }),
  ].filter(isNonEmptyString);
};

// Tags each deletion caused by another deletion in the migration with its root deletion.
export const annotateCascadedDeletions = <TAction extends AnnotatableAction>(
  actions: TAction[],
): CascadeAnnotatedAction<TAction>[] => {
  const deletionByUniversalIdentifier = new Map<string, TAction>();

  for (const action of actions) {
    if (
      action.type === 'delete' &&
      isNonEmptyString(action.universalIdentifier)
    ) {
      deletionByUniversalIdentifier.set(action.universalIdentifier, action);
    }
  }

  const findParent = (action: TAction) =>
    getParentReferences(action)
      .map((reference) => deletionByUniversalIdentifier.get(reference))
      .find((parent) => isDefined(parent) && parent !== action);

  // A reference loop has no root, so every deletion in it stays listed.
  const findRoot = (action: TAction) => {
    const visited = new Set<TAction>([action]);
    let root = findParent(action);

    while (isDefined(root)) {
      const parent = findParent(root);

      if (!isDefined(parent)) {
        return root;
      }

      if (visited.has(parent)) {
        return undefined;
      }

      visited.add(root);
      root = parent;
    }

    return undefined;
  };

  return actions.map((action) => {
    if (action.type !== 'delete') {
      return action;
    }

    const root = findRoot(action);

    return isDefined(root?.universalIdentifier)
      ? { ...action, cascadedFromUniversalIdentifier: root.universalIdentifier }
      : action;
  });
};
