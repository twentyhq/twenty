import { recordPageLayoutsState } from '@/page-layout/states/recordPageLayoutsState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { selectorFamily } from 'recoil';

export const recordPageLayoutByObjectMetadataIdFamilySelector = selectorFamily<
  PageLayout | undefined,
  { objectMetadataId: string }
>({
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
