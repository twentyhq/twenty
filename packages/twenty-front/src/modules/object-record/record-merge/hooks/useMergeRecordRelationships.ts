import { useLazyQuery } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';
import { useRecoilCallback } from 'recoil';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { mergeRecordRelationshipData } from '@/object-record/record-merge/utils/mergeRelationshipData';
import { buildFindOneRecordForShowPageOperationSignature } from '@/object-record/record-show/graphql/operations/factories/findOneRecordForShowPageOperationSignatureFactory';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

type UseMergeRecordRelationshipsProps = {
  objectNameSingular: string;
  previewRecordId: string;
  selectedRecords: ObjectRecord[];
};

type MergedRelationshipData = Record<
  string,
  ObjectRecord[] | ObjectRecord | null
>;

type UseMergeRecordRelationshipsResult = {
  isLoading: boolean;
  mergedRelationshipData: MergedRelationshipData;
  error?: Error;
};

export const useMergeRecordRelationships = ({
  objectNameSingular,
  previewRecordId,
  selectedRecords,
}: UseMergeRecordRelationshipsProps): UseMergeRecordRelationshipsResult => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const { objectMetadataItems } = useObjectMetadataItems();
  const [completeRecords, setCompleteRecords] = useState<ObjectRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const recordGqlFields = useMemo(() => {
    return buildFindOneRecordForShowPageOperationSignature({
      objectMetadataItem,
      objectMetadataItems,
    }).fields;
  }, [objectMetadataItem, objectMetadataItems]);

  const apolloCoreClient = useApolloCoreClient();

  const { findManyRecordsQuery } = useFindManyRecordsQuery({
    objectNameSingular,
    recordGqlFields,
  });

  const [findManyRecords] = useLazyQuery<RecordGqlOperationFindManyResult>(
    findManyRecordsQuery,
    {
      fetchPolicy: 'cache-first',
      client: apolloCoreClient,
    },
  );

  useEffect(() => {
    if (selectedRecords.length === 0 || !previewRecordId) {
      return;
    }

    const fetchCompleteRecords = async () => {
      setIsLoading(true);
      setError(undefined);

      try {
        const result = await findManyRecords({
          variables: {
            filter: {
              id: {
                in: selectedRecords.map((record) => record.id),
              },
            },
          },
        });

        const records = getRecordsFromRecordConnection({
          recordConnection: {
            edges: result?.data?.[objectMetadataItem.namePlural]?.edges ?? [],
            pageInfo: result?.data?.[objectMetadataItem.namePlural]
              ?.pageInfo ?? {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: '',
              endCursor: '',
            },
          },
        });

        setCompleteRecords(records || []);
      } catch (fetchError) {
        const errorMessage =
          fetchError instanceof Error
            ? fetchError.message
            : 'Failed to fetch complete records';
        setError(
          new Error(`Failed to merge record relationships: ${errorMessage}`),
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompleteRecords();
  }, [
    selectedRecords,
    findManyRecords,
    previewRecordId,
    objectMetadataItem.namePlural,
  ]);

  const mergedRelationshipData = useMemo((): MergedRelationshipData => {
    return mergeRecordRelationshipData(
      completeRecords,
      objectMetadataItem.fields,
      isLoading,
    );
  }, [completeRecords, objectMetadataItem.fields, isLoading]);

  const updatePreviewRecordStore = useRecoilCallback(
    ({ set }) =>
      async (relationshipData: MergedRelationshipData) => {
        if (Object.keys(relationshipData).length === 0) return;

        set(recordStoreFamilyState(previewRecordId), (prevRecord) => {
          if (!prevRecord) return prevRecord;

          return {
            ...prevRecord,
            ...relationshipData,
          };
        });
      },
    [previewRecordId],
  );

  useEffect(() => {
    if (!isLoading && Object.keys(mergedRelationshipData).length > 0) {
      updatePreviewRecordStore(mergedRelationshipData);
    }
  }, [isLoading, mergedRelationshipData, updatePreviewRecordStore]);

  return {
    isLoading,
    mergedRelationshipData,
    error,
  };
};
