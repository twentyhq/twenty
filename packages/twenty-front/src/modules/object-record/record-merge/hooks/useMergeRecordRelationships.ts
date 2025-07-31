import { useEffect, useMemo, useState } from 'react';
import { useRecoilCallback } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
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

  const { findManyRecordsLazy } = useLazyFindManyRecords({
    objectNameSingular,
    recordGqlFields,
    filter: {
      id: {
        in: selectedRecords.map((record) => record.id),
      },
    },
  });

  useEffect(() => {
    if (selectedRecords.length === 0 || !previewRecordId) {
      setCompleteRecords([]);
      setError(undefined);
      return;
    }

    const fetchCompleteRecords = async () => {
      setIsLoading(true);
      setError(undefined);

      try {
        const { records } = await findManyRecordsLazy();
        setCompleteRecords(records || []);
      } catch (fetchError) {
        const errorMessage =
          fetchError instanceof Error
            ? fetchError.message
            : 'Failed to fetch complete records';
        setError(
          new Error(`Failed to merge record relationships: ${errorMessage}`),
        );
        setCompleteRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompleteRecords();
  }, [selectedRecords, findManyRecordsLazy, previewRecordId]);

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
