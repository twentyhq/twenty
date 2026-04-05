import { useCallback, useEffect, useRef, useState } from 'react';

import { JUSTUS_TRUTH_REVIEW_GQL_FIELDS } from '@/data-validator/constants/JustusTruthGqlFields.constants';
import { JUSTUS_TRUTH_OBJECT_NAME_SINGULAR } from '@/data-validator/constants/JustusTruthObjectName.constants';
import {
  PREFETCH_AHEAD,
  REVIEW_QUEUE_PAGE_SIZE,
} from '@/data-validator/constants/JustusTruthDomains.constants';
import { type JustusTruthRecord } from '@/data-validator/types/data-validator.types';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

export const useJustusTruthQueue = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const localQueue = useRef<JustusTruthRecord[]>([]);
  const initialized = useRef(false);

  const {
    records,
    loading,
    fetchMoreRecords,
    hasNextPage,
    totalCount,
  } = useFindManyRecords({
    objectNameSingular: JUSTUS_TRUTH_OBJECT_NAME_SINGULAR,
    filter: { status: { eq: 'candidate' } },
    orderBy: [{ evidenceCount: 'DescNullsLast' as const }],
    recordGqlFields: JUSTUS_TRUTH_REVIEW_GQL_FIELDS,
    limit: REVIEW_QUEUE_PAGE_SIZE,
  });

  // Sync fetched records into local queue on first load and when more are fetched
  useEffect(() => {
    if (records.length > 0) {
      if (!initialized.current) {
        localQueue.current = [...records] as JustusTruthRecord[];
        initialized.current = true;
      } else if (records.length > localQueue.current.length + currentIndex) {
        // New records from fetchMoreRecords — append only genuinely new ones
        const existingIds = new Set(localQueue.current.map((r) => r.id));
        const newRecords = (records as JustusTruthRecord[]).filter(
          (r) => !existingIds.has(r.id),
        );
        if (newRecords.length > 0) {
          localQueue.current = [...localQueue.current, ...newRecords];
        }
      }
    }
  }, [records, currentIndex]);

  // Prefetch when approaching end of loaded batch
  useEffect(() => {
    if (
      hasNextPage &&
      localQueue.current.length - currentIndex <= PREFETCH_AHEAD &&
      !loading
    ) {
      fetchMoreRecords?.();
    }
  }, [currentIndex, hasNextPage, loading, fetchMoreRecords]);

  const currentTruth: JustusTruthRecord | null =
    localQueue.current[currentIndex] ?? null;

  const removeCurrent = useCallback(() => {
    localQueue.current.splice(currentIndex, 1);
    // If we removed the last item and there are items before, stay at the same index
    // (which now points to the next item) or go back
    if (currentIndex >= localQueue.current.length && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      // Force re-render since useRef doesn't trigger it
      setCurrentIndex((prev) => prev);
    }
    // Trigger re-render
    setCurrentIndex((idx) =>
      idx >= localQueue.current.length
        ? Math.max(0, localQueue.current.length - 1)
        : idx,
    );
  }, [currentIndex]);

  const restoreTruth = useCallback(
    (record: JustusTruthRecord) => {
      localQueue.current.splice(currentIndex, 0, record);
      setCurrentIndex((idx) => idx);
    },
    [currentIndex],
  );

  const skipToNext = useCallback(() => {
    if (currentIndex < localQueue.current.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex]);

  const isEmpty =
    !loading && initialized.current && localQueue.current.length === 0;

  return {
    currentTruth,
    removeCurrent,
    restoreTruth,
    skipToNext,
    loading: loading && !initialized.current,
    isEmpty,
    remainingCount: localQueue.current.length - currentIndex,
    totalCount: totalCount ?? 0,
  };
};
