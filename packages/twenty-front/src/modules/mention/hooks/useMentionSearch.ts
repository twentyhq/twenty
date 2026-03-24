import { SEARCH_QUERY } from '@/command-menu/graphql/queries/search';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useReadableObjectMetadataItems } from '@/object-metadata/hooks/useReadableObjectMetadataItems';
import { useCallback, useMemo } from 'react';
import {
  type SearchQuery,
  type SearchQueryVariables,
} from '~/generated/graphql';
import type { MentionSearchResult } from '@/mention/types/MentionSearchResult';

const MENTION_SEARCH_LIMIT = 50;

export const useMentionSearch = () => {
  const { readableObjectMetadataItems } = useReadableObjectMetadataItems();
  const apolloCoreClient = useApolloCoreClient();

  const searchableObjectMetadataItems = useMemo(
    () =>
      readableObjectMetadataItems.filter(
        (item) => !item.isSystem && item.isSearchable,
      ),
    [readableObjectMetadataItems],
  );

  const objectsToSearch = useMemo(
    () => searchableObjectMetadataItems.map(({ nameSingular }) => nameSingular),
    [searchableObjectMetadataItems],
  );

  const searchMentionRecords = useCallback(
    async (query: string): Promise<MentionSearchResult[]> => {
      const { data } = await apolloCoreClient.query<
        SearchQuery,
        SearchQueryVariables
      >({
        query: SEARCH_QUERY,
        variables: {
          searchInput: query,
          limit: MENTION_SEARCH_LIMIT,
          includedObjectNameSingulars: objectsToSearch,
        },
      });

      const searchRecords = data?.search.edges.map((edge) => edge.node) ?? [];

      return searchRecords.map((searchRecord) => ({
        recordId: searchRecord.recordId,
        objectNameSingular: searchRecord.objectNameSingular,
        objectLabelSingular: searchRecord.objectLabelSingular,
        label: searchRecord.label,
        imageUrl: searchRecord.imageUrl ?? '',
      }));
    },
    [apolloCoreClient, objectsToSearch],
  );

  return { searchMentionRecords, searchableObjectMetadataItems };
};
