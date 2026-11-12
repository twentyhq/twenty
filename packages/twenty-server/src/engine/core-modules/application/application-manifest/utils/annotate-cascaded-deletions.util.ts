import { isNonEmptyString } from '@sniptt/guards';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ALL_MANY_TO_ONE_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant';

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

const getRequiredParentReferences = (
  action: Pick<AnnotatableAction, 'metadataName' | 'flatEntity'>,
) =>
  Object.values<ManyToOneRelation | null>(
    ALL_MANY_TO_ONE_METADATA_RELATIONS[action.metadataName],
  )
    .filter(isDefined)
    .filter((relation) => !relation.isNullable)
    .map((relation) => action.flatEntity?.[relation.universalForeignKey])
    .filter(isNonEmptyString);

// A deletion's cause is its side-effect trigger, else a deleted parent it cannot exist without.
export const annotateCascadedDeletions = <TAction extends AnnotatableAction>({
  actions,
  deletionTriggerByUniversalIdentifier = {},
}: {
  actions: TAction[];
  deletionTriggerByUniversalIdentifier?: Record<string, string>;
}): CascadeAnnotatedAction<TAction>[] => {
  const deletionByUniversalIdentifier = new Map<string, TAction>();

  for (const action of actions) {
    if (
      action.type === 'delete' &&
      isNonEmptyString(action.universalIdentifier)
    ) {
      deletionByUniversalIdentifier.set(action.universalIdentifier, action);
    }
  }

  const findCause = (action: TAction) =>
    [
      deletionTriggerByUniversalIdentifier[action.universalIdentifier ?? ''],
      ...getRequiredParentReferences(action),
    ]
      .filter(isNonEmptyString)
      .map((reference) => deletionByUniversalIdentifier.get(reference))
      .find((cause) => isDefined(cause) && cause !== action);

  const findRoot = (action: TAction) => {
    const visited = new Set<TAction>([action]);
    let root: TAction | undefined;

    for (
      let cause = findCause(action);
      isDefined(cause);
      cause = findCause(cause)
    ) {
      if (visited.has(cause)) {
        return undefined;
      }

      visited.add(cause);
      root = cause;
    }

    return root;
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
