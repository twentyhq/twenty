import { useMutation } from '@apollo/client';

import { ObjectMetadataItemIdentifier } from '../types/ObjectMetadataItemIdentifier';

import { useFindOneObjectMetadataItem } from './useFindOneObjectMetadataItem';

export const useUpdateOneObject = ({
  objectNamePlural,
  objectNameSingular,
}: ObjectMetadataItemIdentifier) => {
  const {
    foundObjectMetadataItem,
    objectNotFoundInMetadata,
    updateOneMutation,
  } = useFindOneObjectMetadataItem({
    objectNamePlural,
    objectNameSingular,
  });

  // TODO: type this with a minimal type at least with Record<string, any>
  const [mutate] = useMutation(updateOneMutation);

  const updateOneObject = foundObjectMetadataItem
    ? ({
        idToUpdate,
        input,
      }: {
        idToUpdate: string;
        input: Record<string, any>;
      }) => {
        return mutate({
          variables: {
            idToUpdate: idToUpdate,
            input: {
              ...input,
            },
          },
          // update: (cache, result, options) => {
          //   console.log({
          //     cache,
          //     result,
          //     options,
          //     objectNamePlural,
          //     objectNameSingular,
          //   });

          //   if (!objectNamePlural || !objectNameSingular) return;

          //   const graphQLFieldForUpdateOneObjectMutation =
          //     getUpdateOneObjectMutationGraphQLField({
          //       objectNameSingular,
          //     });

          //   console.log({ graphQLFieldForUpdateOneObjectMutation });

          //   const updatedObject =
          //     result.data?.[graphQLFieldForUpdateOneObjectMutation];

          //   cache.modify({
          //     fields: {
          //       [objectNamePlural]: (
          //         existingObjectPaginatedResult: PaginatedObjectTypeResults<{
          //           id: string;
          //         }>,
          //       ) => {
          //         console.log({
          //           existingObjectPaginatedResult,
          //         });
          //         return produce(existingObjectPaginatedResult, (draft) => {
          //           const existingItemIndex = draft.edges.findIndex(
          //             (edge) => edge.node.id === idToUpdate,
          //           );

          //           console.log({
          //             existingItemIndex,
          //             idToUpdate,
          //           });

          //           if (existingItemIndex > -1) {
          //             draft.edges[existingItemIndex].node = {
          //               ...updatedObject,
          //             };
          //           }

          //           return draft;
          //         });
          //       },
          //     },
          //   });
          // },
        });
      }
    : undefined;

  return {
    updateOneObject,
    objectNotFoundInMetadata,
  };
};
