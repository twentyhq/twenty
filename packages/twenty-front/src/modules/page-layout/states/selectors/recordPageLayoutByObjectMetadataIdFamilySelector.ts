import { pageLayoutsWithRelationsSelector } from '@/page-layout/states/pageLayoutsWithRelationsSelector';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { PageLayoutType } from '~/generated-metadata/graphql';

export const recordPageLayoutByObjectMetadataIdFamilySelector =
  createAtomFamilySelector<
    PageLayout | undefined,
    { objectMetadataId: string }
  >({
    key: 'recordPageLayoutByObjectMetadataIdFamilySelector',
    get:
      ({ objectMetadataId }) =>
      ({ get }) => {
        const pageLayouts = get(pageLayoutsWithRelationsSelector);

        return pageLayouts.find(
          (pageLayout) =>
            pageLayout.type === PageLayoutType.RECORD_PAGE &&
            pageLayout.objectMetadataId === objectMetadataId,
        );
      },
  });
