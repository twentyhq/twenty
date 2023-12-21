import { OptimisticEffectDefinition } from '@/apollo/optimistic-effect/types/OptimisticEffectDefinition';
import { ObjectRecordQueryVariables } from '@/object-record/types/ObjectRecordQueryVariables';

export const computeOptimisticEffectKey = ({
  variables,
  definition,
}: {
  variables: ObjectRecordQueryVariables;
  definition: OptimisticEffectDefinition;
}) => {
  const computedKey =
    (definition.objectMetadataItem?.namePlural ?? definition.typename) +
    '-' +
    JSON.stringify(variables);

  return computedKey;
};
