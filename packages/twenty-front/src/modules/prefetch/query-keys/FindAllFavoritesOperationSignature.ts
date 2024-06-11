import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordGqlOperationSignature } from '@/object-record/graphql/types/RecordGqlOperationSignature';

export const FIND_ALL_FAVORITES_OPERATION_SIGNATURE: RecordGqlOperationSignature =
  {
    objectNameSingular: CoreObjectNameSingular.Favorite,
    variables: {},
  };
