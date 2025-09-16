import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { type PageLayoutWithData } from '@/page-layout/types/pageLayoutTypes';
import { WidgetPlaceholder } from '@/page-layout/widgets/components/WidgetPlaceholder';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { type Widget } from '@/page-layout/widgets/types/Widget';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

export const PageLayoutGridContent = ({
  pageLayout,
}: {
  pageLayout: PageLayoutWithData;
}) => {
  const pageLayoutDraft = useRecoilComponentValue(
    pageLayoutDraftComponentState,
  );

  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  const currentPageLayout = isPageLayoutInEditMode
    ? pageLayoutDraft
    : pageLayout;

  const activeTabId = useRecoilComponentValue(activeTabIdComponentState);

  const activeTabWidgets = currentPageLayout.tabs.find(
    (tab) => tab.id === activeTabId,
  )?.widgets;

  const isEmptyState =
    !isDefined(activeTabWidgets) || activeTabWidgets.length === 0;

  return (
    <>
      {isEmptyState ? (
        <div key="empty-placeholder" data-select-disable="true">
          <WidgetPlaceholder onClick={() => {}} />
        </div>
      ) : (
        activeTabWidgets?.map((widget) => (
          <div key={widget.id} data-select-disable="true">
            <WidgetRenderer widget={widget as Widget} />
          </div>
        ))
      )}
    </>
  );
};
