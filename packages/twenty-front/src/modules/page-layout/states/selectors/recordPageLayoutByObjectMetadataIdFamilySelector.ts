import { recordPageLayoutsState } from '@/page-layout/states/recordPageLayoutsState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { createFamilySelector } from '@/ui/utilities/state/jotai/utils/createFamilySelector';

export const recordPageLayoutByObjectMetadataIdFamilySelector =
  createFamilySelector<PageLayout | undefined, { objectMetadataId: string }>({
    key: 'recordPageLayoutByObjectMetadataIdFamilySelector',
    get:
      ({ objectMetadataId }) =>
      ({ get }) => {
        const recordPageLayouts = get(recordPageLayoutsState);

        return recordPageLayouts.find(
          (pageLayout) => pageLayout.objectMetadataId === objectMetadataId,
        );
      },
  });
