import {
  FIND_MANY_FIELD_METADATA_ITEMS,
  FIND_MANY_OBJECT_METADATA_ITEMS,
} from '@/object-metadata/graphql/queries';
import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { isAppWaitingForFreshObjectMetadataState } from '@/object-metadata/states/isAppWaitingForFreshObjectMetadataState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapPaginatedObjectMetadataItemsToObjectMetadataItems } from '@/object-metadata/utils/mapPaginatedObjectMetadataItemsToObjectMetadataItems';
import { useRecoilCallback } from 'recoil';
import {
  FieldMetadataItemsQuery,
  FieldMetadataItemsQueryVariables,
  ObjectMetadataItemsQuery,
} from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const MAXIMUM_FIELDS_PER_OBJECT = 2000;
export const PAGE_SIZE = MAXIMUM_FIELDS_PER_OBJECT / 2;

type FetchPolicy = 'network-only' | 'cache-first';

export const useRefreshObjectMetadataItems = (
  fetchPolicy: FetchPolicy = 'cache-first',
) => {
  const client = useApolloMetadataClient();

  const fetchFieldsForObject = async (
    variables: FieldMetadataItemsQueryVariables,
  ) => {
    try {
      const result = await client.query<FieldMetadataItemsQuery>({
        query: FIND_MANY_FIELD_METADATA_ITEMS,
        variables: variables,
        fetchPolicy: 'network-only',
      });

      return result.data;
    } catch (error) {
      throw new Error(
        `Error fetching fields for object ${variables.fieldFilter?.objectMetadataId}`,
      );
    }
  };

  const fetchAllFieldsForObject = async (objectMetadataId: string) => {
    const result = await fetchFieldsForObject({
      fieldFilter: { objectMetadataId: { eq: objectMetadataId } },
      paging: { first: PAGE_SIZE },
    });
    let edges = result.fields.edges;
    let pageInfo = result.fields.pageInfo;

    while (pageInfo.hasNextPage) {
      const nextPage = await fetchFieldsForObject({
        fieldFilter: { objectMetadataId: { eq: objectMetadataId } },
        paging: { first: PAGE_SIZE, after: pageInfo.endCursor },
      });

      if (
        edges.length + nextPage.fields.edges.length >
        MAXIMUM_FIELDS_PER_OBJECT
      ) {
        console.warn(
          `Too many fields for object ${objectMetadataId}. Maximum is ${MAXIMUM_FIELDS_PER_OBJECT}.`,
        );
        break;
      }

      edges = [...edges, ...nextPage.fields.edges];
      pageInfo = nextPage.fields.pageInfo;
    }

    return { edges, pageInfo };
  };

  const refreshObjectMetadataItems = async () => {
    // Fetch all object metadata, including fields.
    const result = await client.query<ObjectMetadataItemsQuery>({
      query: FIND_MANY_OBJECT_METADATA_ITEMS,
      variables: {},
      fetchPolicy,
    });

    const objectMetadataItems =
      mapPaginatedObjectMetadataItemsToObjectMetadataItems({
        pagedObjectMetadataItems: result.data,
      });

    await Promise.all(
      objectMetadataItems.map(async (objectMeta: ObjectMetadataItem) => {
        const objectFields = await fetchAllFieldsForObject(objectMeta.id);

        objectMeta.fields = objectFields.edges.map(
          (edge) => edge.node as FieldMetadataItem,
        );
      }),
    );

    replaceObjectMetadataItemIfDifferent(objectMetadataItems);

    return objectMetadataItems;
  };

  const replaceObjectMetadataItemIfDifferent = useRecoilCallback(
    ({ set, snapshot }) =>
      (toSetObjectMetadataItems: ObjectMetadataItem[]) => {
        if (
          !isDeeplyEqual(
            snapshot.getLoadable(objectMetadataItemsState).getValue(),
            toSetObjectMetadataItems,
          )
        ) {
          set(objectMetadataItemsState, toSetObjectMetadataItems);
          set(isAppWaitingForFreshObjectMetadataState, false);
        }
      },
    [],
  );

  return {
    refreshObjectMetadataItems,
  };
};
