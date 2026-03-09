import { CoreObjectNameSingular } from 'twenty-shared/types';
import { type RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';

export const findAllFavoritesFolderOperationSignatureFactory: RecordGqlOperationSignatureFactory<
  object
> = () => ({
  objectNameSingular: CoreObjectNameSingular.FavoriteFolder,
  variables: {},
  fields: {
    id: true,
    position: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    name: true,
    icon: true,
  },
});
