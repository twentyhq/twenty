import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';

type CreateOneCommentOperationSignatureFactoryParams = Record<string, never>;

export const createOneCommentOperationSignatureFactory: RecordGqlOperationSignatureFactory<
  CreateOneCommentOperationSignatureFactoryParams
> = () => ({
  objectNameSingular: CoreObjectNameSingular.Comment,
  variables: {},
  fields: {
    id: true,
    __typename: true,
    createdAt: true,
    updatedAt: true,
    body: {
      blocknote: true,
      markdown: true,
    },
    author: {
      id: true,
      name: true,
      avatarUrl: true,
      __typename: true,
    },
    authorId: true,
  },
});
