import { useCallback, useEffect, useState } from 'react';

import { useWhatsAppBridge } from '@/whatsapp-chat/hooks/useWhatsAppBridge';

export interface VimeoVideo {
  id: string;
  videoId: string;
  videoName: string;
  videoDescription: string | null;
  duration: number | null;
  width: number | null;
  height: number | null;
  views: number | null;
  vimeoLink: string | null;
  thumbnailUrl: string | null;
  tobAppLink: string | null;
  tobCategory: string | null;
  tobCategoryKey: string | null;
  folderName: string | null;
  createdTime: string | null;
}

export interface VideoCategory {
  key: string;
  label: string;
  count: number;
}

interface VideosResponse {
  items: VimeoVideo[];
  total: number;
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

interface CategoriesResponse {
  categories: VideoCategory[];
}

const CATEGORY_EMOJIS: Record<string, string> = {
  headache: '🧠',
  'neck-shoulder': '💪',
  'lower-back': '🔙',
  hip: '🦴',
  knee: '🦵',
};

export function getCategoryEmoji(key: string): string {
  return CATEGORY_EMOJIS[key] ?? '📹';
}

export function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const useVimeoVideos = () => {
  const { bridgeFetch } = useWhatsAppBridge();
  const [videos, setVideos] = useState<VimeoVideo[]>([]);
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      const data = await bridgeFetch<CategoriesResponse>(
        '/api/v1/vimeo-videos/categories',
      );
      setCategories(data.categories);
    } catch {
      setCategories([]);
    }
  }, [bridgeFetch]);

  const fetchVideos = useCallback(
    async (category: string | null, cursor?: string | null) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: '50' });
        if (category) params.set('category', category);
        if (cursor) params.set('cursor', cursor);

        const data = await bridgeFetch<VideosResponse>(
          `/api/v1/vimeo-videos/?${params.toString()}`,
        );

        if (cursor) {
          setVideos((prev) => [...prev, ...data.items]);
        } else {
          setVideos(data.items);
        }
        setNextCursor(data.pageInfo?.endCursor ?? null);
        setHasMore(data.pageInfo?.hasNextPage ?? false);
      } catch {
        if (!cursor) setVideos([]);
      } finally {
        setLoading(false);
      }
    },
    [bridgeFetch],
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchVideos(activeCategory);
  }, [fetchVideos, activeCategory]);

  const selectCategory = useCallback((key: string | null) => {
    setActiveCategory(key);
    setSearchQuery('');
  }, []);

  const loadMore = useCallback(() => {
    if (nextCursor) {
      fetchVideos(activeCategory, nextCursor);
    }
  }, [fetchVideos, activeCategory, nextCursor]);

  // Client-side search filter
  const filteredVideos = searchQuery.trim()
    ? videos.filter(
        (v) =>
          v.videoName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (v.folderName ?? '')
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      )
    : videos;

  return {
    videos: filteredVideos,
    allVideos: videos,
    categories,
    activeCategory,
    selectCategory,
    loading,
    loadMore,
    hasMore,
    searchQuery,
    setSearchQuery,
  };
};
