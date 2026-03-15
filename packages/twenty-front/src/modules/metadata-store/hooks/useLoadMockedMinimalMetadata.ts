import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { splitObjectMetadataItemWithRelated } from '@/metadata-store/utils/splitObjectMetadataItemWithRelated';
import { splitViewWithRelated } from '@/metadata-store/utils/splitViewWithRelated';
import { useCallback } from 'react';

const MOCKED_COLLECTION_HASH = 'mocked';

export const useLoadMockedMinimalMetadata = () => {
  const { updateDraft, applyChanges, resetMetadataStore } = useMetadataStore();

  const loadMockedMinimalMetadata = useCallback(async () => {
    resetMetadataStore();
    const [
      { generatedMockObjectMetadataItems },
      { mockedCoreViews },
      { mockedNavigationMenuItems },
    ] = await Promise.all([
      import('~/testing/utils/generatedMockObjectMetadataItems'),
      import('~/testing/mock-data/generated/metadata/views/mock-views-data'),
      import(
        '~/testing/mock-data/generated/metadata/navigation-menu-items/mock-navigation-menu-items-data'
      ),
    ]);

    const { flatObjects, flatFields, flatIndexes } =
      splitObjectMetadataItemWithRelated(generatedMockObjectMetadataItems);

    updateDraft('objectMetadataItems', flatObjects, MOCKED_COLLECTION_HASH);
    updateDraft('fieldMetadataItems', flatFields, MOCKED_COLLECTION_HASH);
    updateDraft('indexMetadataItems', flatIndexes, MOCKED_COLLECTION_HASH);

    const {
      flatViews,
      flatViewFields,
      flatViewFilters,
      flatViewSorts,
      flatViewGroups,
      flatViewFilterGroups,
      flatViewFieldGroups,
    } = splitViewWithRelated(mockedCoreViews);

    updateDraft('views', flatViews, MOCKED_COLLECTION_HASH);
    updateDraft('viewFields', flatViewFields, MOCKED_COLLECTION_HASH);
    updateDraft('viewFilters', flatViewFilters, MOCKED_COLLECTION_HASH);
    updateDraft('viewSorts', flatViewSorts, MOCKED_COLLECTION_HASH);
    updateDraft('viewGroups', flatViewGroups, MOCKED_COLLECTION_HASH);
    updateDraft(
      'viewFilterGroups',
      flatViewFilterGroups,
      MOCKED_COLLECTION_HASH,
    );
    updateDraft('viewFieldGroups', flatViewFieldGroups, MOCKED_COLLECTION_HASH);

    updateDraft(
      'navigationMenuItems',
      mockedNavigationMenuItems,
      MOCKED_COLLECTION_HASH,
    );

    applyChanges();
  }, [updateDraft, applyChanges, resetMetadataStore]);

  return { loadMockedMinimalMetadata };
};
