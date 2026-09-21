import { pageLayoutsWithRelationsSelector } from '@/page-layout/states/pageLayoutsWithRelationsSelector';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { PageLayoutType } from '~/generated-metadata/graphql';

export const recordFormPageLayoutByObjectMetadataIdFamilySelector =
  createAtomFamilySelector<
    PageLayout | undefined,
    { objectMetadataId: string }
  >({
    key: 'recordFormPageLayoutByObjectMetadataIdFamilySelector',
    get:
      ({ objectMetadataId }) =>
      ({ get }) => {
        const pageLayouts = get(pageLayoutsWithRelationsSelector);

        const recordFormPageLayouts = pageLayouts.filter(
          (pageLayout) =>
            pageLayout.type === PageLayoutType.RECORD_FORM &&
            pageLayout.objectMetadataId === objectMetadataId,
        );

        const customRecordFormPageLayout = recordFormPageLayouts.find(
          (pageLayout) => !pageLayout.isSystemSideEffect,
        );

        return customRecordFormPageLayout ?? recordFormPageLayouts[0];
      },
  });
