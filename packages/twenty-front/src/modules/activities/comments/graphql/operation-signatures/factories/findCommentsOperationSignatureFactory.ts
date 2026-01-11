import { generateActivityTargetMorphFieldKeys } from '@/activities/utils/generateActivityTargetMorphFieldKeys';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';

type FindCommentsOperationSignatureFactoryParams = {
  objectMetadataItems: ObjectMetadataItem[];
};

export const findCommentsOperationSignatureFactory: RecordGqlOperationSignatureFactory<
  FindCommentsOperationSignatureFactoryParams
> = ({ objectMetadataItems }: FindCommentsOperationSignatureFactoryParams) => {
  return {
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
      commentTargets: {
        id: true,
        __typename: true,
        createdAt: true,
        updatedAt: true,
        comment: true,
        commentId: true,
        ...generateActivityTargetMorphFieldKeys(objectMetadataItems),
      },
    },
  };
};
