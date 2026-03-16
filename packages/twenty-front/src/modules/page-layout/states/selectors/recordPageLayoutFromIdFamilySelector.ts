import { pageLayoutsWithRelationsSelector } from '@/page-layout/states/pageLayoutsWithRelationsSelector';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { PageLayoutType } from '~/generated-metadata/graphql';

export const recordPageLayoutFromIdFamilySelector = createAtomFamilySelector<
  PageLayout | undefined,
  { pageLayoutId: string }
>({
  key: 'recordPageLayoutFromIdFamilySelector',
  get:
    ({ pageLayoutId }) =>
    ({ get }) => {
      const pageLayouts = get(pageLayoutsWithRelationsSelector);

      return pageLayouts.find(
        (pageLayout) =>
          pageLayout.type === PageLayoutType.RECORD_PAGE &&
          pageLayout.id === pageLayoutId,
      );
    },
});
