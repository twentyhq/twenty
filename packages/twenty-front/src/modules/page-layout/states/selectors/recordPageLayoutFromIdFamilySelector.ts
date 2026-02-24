import { recordPageLayoutsState } from '@/page-layout/states/recordPageLayoutsState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { createFamilySelectorV2 } from '@/ui/utilities/state/jotai/utils/createFamilySelectorV2';

export const recordPageLayoutFromIdFamilySelector = createFamilySelectorV2<
  PageLayout | undefined,
  { pageLayoutId: string }
>({
  key: 'recordPageLayoutFromIdFamilySelector',
  get:
    ({ pageLayoutId }) =>
    ({ get }) => {
      const recordPageLayouts = get(recordPageLayoutsState);

      return recordPageLayouts.find(
        (pageLayout) => pageLayout.id === pageLayoutId,
      );
    },
});
