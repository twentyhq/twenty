import { type DynamicFieldResolverInstance } from 'src/engine/api/common/common-dynamic-fields/types/dynamic-field-resolver-instance.type';

export type DynamicFieldContextLoader = <TContext>(
  dynamicFieldResolver: DynamicFieldResolverInstance<TContext>,
) => Promise<TContext>;
