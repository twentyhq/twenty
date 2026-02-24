import { recordPageLayoutsState } from '@/page-layout/states/recordPageLayoutsState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { createFamilySelectorV2 } from '@/ui/utilities/state/jotai/utils/createFamilySelectorV2';

export const recordPageLayoutByObjectMetadataIdFamilySelector =
  createFamilySelectorV2<PageLayout | undefined, { objectMetadataId: string }>({
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
