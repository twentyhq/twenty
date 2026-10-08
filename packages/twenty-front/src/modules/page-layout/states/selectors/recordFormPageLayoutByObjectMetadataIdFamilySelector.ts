import { pageLayoutsWithRelationsSelector } from '@/page-layout/states/pageLayoutsWithRelationsSelector';
import { pageLayoutWidgetsByTabIdSelector } from '@/page-layout/states/selectors/pageLayoutWidgetsByTabIdSelector';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { isDefined } from 'twenty-shared/utils';
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

        const recordFormPageLayout =
          customRecordFormPageLayout ?? recordFormPageLayouts[0];

        if (!isDefined(recordFormPageLayout)) {
          return undefined;
        }

        const widgetsByTabId = get(pageLayoutWidgetsByTabIdSelector);

        return {
          ...recordFormPageLayout,
          tabs: recordFormPageLayout.tabs.map((tab) => ({
            ...tab,
            widgets: widgetsByTabId.get(tab.id) ?? [],
          })),
        };
      },
  });
