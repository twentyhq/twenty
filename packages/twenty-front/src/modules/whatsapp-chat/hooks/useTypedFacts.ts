import { useCallback, useEffect, useMemo, useState } from 'react';

import { useWhatsAppBridge } from '@/whatsapp-chat/hooks/useWhatsAppBridge';

export interface TypedFact {
  factId: string;
  email: string;
  extractionKey: string;
  cleanExtraction: string;
  interestLevel: string | null;
  category: string | null;
  similarityScore: number | null;
  touchpointTimestamp: string | null;
  sourceTouchpointId: string | null;
  // From linked touchpoint
  source: string | null;
  direction: string | null;
  touchpointContent: string | null;
  touchpointContext: string | null;
}

export interface TypedFactsAggregation {
  totalCount: number;
  extractionKeyBreakdown: Record<string, number>;
  sourceBreakdown: Record<string, number>;
}

interface RawTypedFact {
  factId: string;
  email: string;
  extractionKey: string;
  cleanExtraction: string;
  interestLevel: string | null;
  category: string | null;
  similarityScore: number | null;
  touchpointTimestamp: string | null;
  sourceTouchpointId: string | null;
  matchedSeedId: string | null;
  touchpoint: {
    source: string | null;
    direction: string | null;
    content: string | null;
    touchpointContext: string | null;
  } | null;
}

interface TypedFactsResponse {
  items: RawTypedFact[];
  total: number;
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

function mapFact(raw: RawTypedFact): TypedFact {
  return {
    factId: raw.factId,
    email: raw.email,
    extractionKey: raw.extractionKey,
    cleanExtraction: raw.cleanExtraction,
    interestLevel: raw.interestLevel,
    category: raw.category,
    similarityScore: raw.similarityScore,
    touchpointTimestamp: raw.touchpointTimestamp,
    sourceTouchpointId: raw.sourceTouchpointId,
    source: raw.touchpoint?.source ?? null,
    direction: raw.touchpoint?.direction ?? null,
    touchpointContent: raw.touchpoint?.content ?? null,
    touchpointContext: raw.touchpoint?.touchpointContext ?? null,
  };
}

type SortOrder = 'desc' | 'asc';

interface ActiveFilters {
  sources: Set<string>;
  extractionKeys: Set<string>;
}

export const useTypedFacts = (email: string | undefined) => {
  const { bridgeFetch } = useWhatsAppBridge();
  const [allFacts, setAllFacts] = useState<TypedFact[]>([]);
  const [aggregation, setAggregation] = useState<TypedFactsAggregation | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    sources: new Set(),
    extractionKeys: new Set(),
  });

  const fetchInitial = useCallback(async () => {
    if (!email) {
      setAllFacts([]);
      setAggregation(null);
      setHasMore(false);
      setNextCursor(null);
      return;
    }

    setLoading(true);

    try {
      const [aggData, factsData] = await Promise.all([
        bridgeFetch<TypedFactsAggregation>(
          `/api/v1/typed-facts/aggregation/${encodeURIComponent(email)}`,
        ),
        bridgeFetch<TypedFactsResponse>(
          `/api/v1/typed-facts/by-email/${encodeURIComponent(email)}?limit=15`,
        ),
      ]);

      setAggregation(aggData);
      setAllFacts(factsData.items.map(mapFact));
      setNextCursor(factsData.pageInfo?.endCursor ?? null);
      setHasMore(factsData.pageInfo?.hasNextPage ?? false);
    } catch {
      setAllFacts([]);
      setAggregation(null);
      setHasMore(false);
      setNextCursor(null);
    } finally {
      setLoading(false);
    }
  }, [bridgeFetch, email]);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  const loadMore = useCallback(async () => {
    if (!email || !nextCursor) return;

    try {
      const data = await bridgeFetch<TypedFactsResponse>(
        `/api/v1/typed-facts/by-email/${encodeURIComponent(email)}?limit=15&cursor=${encodeURIComponent(nextCursor)}`,
      );
      setAllFacts((prev) => [...prev, ...data.items.map(mapFact)]);
      setNextCursor(data.pageInfo?.endCursor ?? null);
      setHasMore(data.pageInfo?.hasNextPage ?? false);
    } catch {
      // Silently fail, keep existing data
    }
  }, [bridgeFetch, email, nextCursor]);

  const applyFilters = useCallback(
    (type: 'source' | 'extractionKey', value: string) => {
      setActiveFilters((prev) => {
        const key = type === 'source' ? 'sources' : 'extractionKeys';
        const next = new Set(prev[key]);
        if (next.has(value)) {
          next.delete(value);
        } else {
          next.add(value);
        }
        return { ...prev, [key]: next };
      });
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setActiveFilters({ sources: new Set(), extractionKeys: new Set() });
  }, []);

  const facts = useMemo(() => {
    let filtered = allFacts;

    if (activeFilters.sources.size > 0) {
      filtered = filtered.filter(
        (f) => f.source !== null && activeFilters.sources.has(f.source),
      );
    }

    if (activeFilters.extractionKeys.size > 0) {
      filtered = filtered.filter((f) =>
        activeFilters.extractionKeys.has(f.extractionKey),
      );
    }

    // Sort by touchpointTimestamp
    const sorted = [...filtered].sort((a, b) => {
      const tA = a.touchpointTimestamp
        ? new Date(a.touchpointTimestamp).getTime()
        : 0;
      const tB = b.touchpointTimestamp
        ? new Date(b.touchpointTimestamp).getTime()
        : 0;
      return sortOrder === 'desc' ? tB - tA : tA - tB;
    });

    return sorted;
  }, [allFacts, activeFilters, sortOrder]);

  const activeFilterCount =
    activeFilters.sources.size + activeFilters.extractionKeys.size;

  return {
    facts,
    allFacts,
    aggregation,
    loading,
    loadMore,
    hasMore,
    applyFilters,
    clearFilters,
    activeFilters,
    activeFilterCount,
    setSortOrder,
    sortOrder,
  };
};
