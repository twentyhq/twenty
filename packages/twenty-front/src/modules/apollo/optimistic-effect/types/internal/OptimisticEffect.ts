import { OptimisticEffectDefinition } from '@/apollo/optimistic-effect/types/OptimisticEffectDefinition';
import { ObjectRecordQueryVariables } from '@/object-record/types/ObjectRecordQueryVariables';

export type OptimisticEffect = OptimisticEffectDefinition & {
  variables: ObjectRecordQueryVariables;
};
