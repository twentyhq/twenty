import { recordPageLayoutsState } from '@/page-layout/states/recordPageLayoutsState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { createFamilySelector } from '@/ui/utilities/state/jotai/utils/createFamilySelector';

export const recordPageLayoutFromIdFamilySelector = createFamilySelector<
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
