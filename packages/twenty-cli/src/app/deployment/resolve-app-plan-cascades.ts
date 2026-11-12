import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type AppPlanAction } from '@/app/deployment/types/app-plan.type';

const UNIVERSAL_IDENTIFIER_SUFFIX = 'UniversalIdentifier';

// Widget configurations name the field they render by universal identifier.
const CONFIGURATION_FIELD_KEYS = [
  'fieldMetadataId',
  'fieldMetadataUniversalIdentifier',
];

// A deletion only cascades from a lower-ranked one, so parents always sit
// closer to the stored data and a chain of parents cannot loop.
const CASCADE_RANK_BY_METADATA_NAME: Record<string, number> = {
  objectMetadata: 0,
  fieldMetadata: 1,
  view: 2,
  pageLayout: 2,
  index: 3,
  searchFieldMetadata: 3,
  pageLayoutTab: 3,
};

const DEFAULT_CASCADE_RANK = 4;

const getCascadeRank = (action: AppPlanAction) =>
  CASCADE_RANK_BY_METADATA_NAME[action.metadataName] ?? DEFAULT_CASCADE_RANK;

export const getActionUniversalIdentifier = (action: AppPlanAction) =>
  action.universalIdentifier ??
  (isNonEmptyString(action.flatEntity?.universalIdentifier)
    ? action.flatEntity.universalIdentifier
    : undefined);

const getReferencedUniversalIdentifiers = (action: AppPlanAction) => {
  const flatEntity = action.flatEntity ?? {};
  const configuration = flatEntity.universalConfiguration;

  const references = Object.entries(flatEntity)
    .filter(
      ([key, value]) =>
        key.endsWith(UNIVERSAL_IDENTIFIER_SUFFIX) &&
        key !== 'universalIdentifier' &&
        key !== 'applicationUniversalIdentifier' &&
        isNonEmptyString(value),
    )
    .map(([, value]) => value as string);

  const configurationReferences = isPlainObject(configuration)
    ? CONFIGURATION_FIELD_KEYS.map((key) => configuration[key]).filter(
        isNonEmptyString,
      )
    : [];

  return [...references, ...configurationReferences];
};

const isSystemSideEffect = (action: AppPlanAction) =>
  action.flatEntity?.isSystemSideEffect === true;

// The inverse of a deleted relation field is removed by the server as a side
// effect: same rank, so it needs its own rule.
const canCascadeFrom = (action: AppPlanAction, parent: AppPlanAction) =>
  getCascadeRank(parent) < getCascadeRank(action) ||
  (action.metadataName === 'fieldMetadata' &&
    parent.metadataName === 'fieldMetadata' &&
    isSystemSideEffect(action) &&
    !isSystemSideEffect(parent));

// Maps each deletion that only happens because another deletion in the same
// plan removes what it belongs to (a deleted object's fields, views and
// layouts, the relation fields pointing at it, a deleted field's view columns
// and widgets) to the root deletion that causes it.
export const resolveAppPlanCascades = (actions: AppPlanAction[]) => {
  const deletionByUniversalIdentifier = new Map<string, AppPlanAction>();

  for (const action of actions) {
    const universalIdentifier = getActionUniversalIdentifier(action);

    if (action.type === 'delete' && isDefined(universalIdentifier)) {
      deletionByUniversalIdentifier.set(universalIdentifier, action);
    }
  }

  const findParent = (action: AppPlanAction) =>
    getReferencedUniversalIdentifiers(action)
      .map((reference) => deletionByUniversalIdentifier.get(reference))
      .filter(
        (parent): parent is AppPlanAction =>
          isDefined(parent) && canCascadeFrom(action, parent),
      )
      .sort(
        (parentA, parentB) => getCascadeRank(parentA) - getCascadeRank(parentB),
      )
      .at(0);

  const rootByCascadedAction = new Map<AppPlanAction, AppPlanAction>();

  for (const action of deletionByUniversalIdentifier.values()) {
    let root = findParent(action);

    for (
      let parent = isDefined(root) ? findParent(root) : undefined;
      isDefined(parent);
      parent = findParent(parent)
    ) {
      root = parent;
    }

    if (isDefined(root)) {
      rootByCascadedAction.set(action, root);
    }
  }

  return rootByCascadedAction;
};
