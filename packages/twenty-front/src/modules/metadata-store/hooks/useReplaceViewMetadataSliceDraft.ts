import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type ViewMetadataSlice } from '@/metadata-store/types/ViewMetadataSlice';
import { useCallback } from 'react';

export const useReplaceViewMetadataSliceDraft = () => {
  const { replaceDraft } = useUpdateMetadataStoreDraft();

  const replaceViewMetadataSliceDraft = useCallback(
    (viewMetadataSlice: ViewMetadataSlice) => {
      replaceDraft('views', viewMetadataSlice.views);
      replaceDraft('viewFields', viewMetadataSlice.viewFields);
      replaceDraft('viewFilters', viewMetadataSlice.viewFilters);
      replaceDraft('viewSorts', viewMetadataSlice.viewSorts);
      replaceDraft('viewGroups', viewMetadataSlice.viewGroups);
      replaceDraft('viewFilterGroups', viewMetadataSlice.viewFilterGroups);
      replaceDraft('viewFieldGroups', viewMetadataSlice.viewFieldGroups);
    },
    [replaceDraft],
  );

  return { replaceViewMetadataSliceDraft };
};
