import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { splitObjectMetadataItemWithRelated } from '@/metadata-store/utils/splitObjectMetadataItemWithRelated';
import { splitViewWithRelated } from '@/metadata-store/utils/splitViewWithRelated';
import { useCallback } from 'react';

const MOCKED_COLLECTION_HASH = 'mocked';

export const useLoadMockedMinimalMetadata = () => {
  const { replaceDraft, applyChanges, resetMetadataStore } = useMetadataStore();

  const loadMockedMinimalMetadata = useCallback(async () => {
    resetMetadataStore();
    const [
      { generatedMockObjectMetadataItems },
      { mockedViews },
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

    replaceDraft('objectMetadataItems', flatObjects, MOCKED_COLLECTION_HASH);
    replaceDraft('fieldMetadataItems', flatFields, MOCKED_COLLECTION_HASH);
    replaceDraft('indexMetadataItems', flatIndexes, MOCKED_COLLECTION_HASH);

    const {
      flatViews,
      flatViewFields,
      flatViewFilters,
      flatViewSorts,
      flatViewGroups,
      flatViewFilterGroups,
      flatViewFieldGroups,
    } = splitViewWithRelated(mockedViews);

    replaceDraft('views', flatViews, MOCKED_COLLECTION_HASH);
    replaceDraft('viewFields', flatViewFields, MOCKED_COLLECTION_HASH);
    replaceDraft('viewFilters', flatViewFilters, MOCKED_COLLECTION_HASH);
    replaceDraft('viewSorts', flatViewSorts, MOCKED_COLLECTION_HASH);
    replaceDraft('viewGroups', flatViewGroups, MOCKED_COLLECTION_HASH);
    replaceDraft(
      'viewFilterGroups',
      flatViewFilterGroups,
      MOCKED_COLLECTION_HASH,
    );
    replaceDraft(
      'viewFieldGroups',
      flatViewFieldGroups,
      MOCKED_COLLECTION_HASH,
    );

    replaceDraft(
      'navigationMenuItems',
      mockedNavigationMenuItems,
      MOCKED_COLLECTION_HASH,
    );

    applyChanges();
  }, [replaceDraft, applyChanges, resetMetadataStore]);

  return { loadMockedMinimalMetadata };
};
