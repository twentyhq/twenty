import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { usePageLayoutIdFromContextStoreOrNull } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

type PageLayoutSidePanelStateProviderProps = {
  children: ReactNode;
};

type PageLayoutSidePanelTabListStateProviderProps =
  PageLayoutSidePanelStateProviderProps & {
    pageLayoutId: string;
    recordId: string;
    objectNameSingular: string;
  };

const PageLayoutSidePanelTabListStateProvider = ({
  children,
  pageLayoutId,
  recordId,
  objectNameSingular,
}: PageLayoutSidePanelTabListStateProviderProps) => {
  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
  );

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutAndRecord({
    pageLayoutId,
    layoutType: pageLayoutDraft.type,
    targetRecordIdentifier: {
      id: recordId,
      targetObjectNameSingular: objectNameSingular,
    },
  });

  return (
    <TabListComponentInstanceContext.Provider
      value={{
        instanceId: tabListInstanceId,
        shouldScopeToWorkspaceSurface: false,
      }}
    >
      {children}
    </TabListComponentInstanceContext.Provider>
  );
};

export const PageLayoutSidePanelStateProvider = ({
  children,
}: PageLayoutSidePanelStateProviderProps) => {
  const { pageLayoutId, recordId, objectNameSingular } =
    usePageLayoutIdFromContextStoreOrNull();

  if (!isDefined(pageLayoutId)) {
    return children;
  }

  return (
    <PageLayoutComponentInstanceContext.Provider
      value={{
        instanceId: pageLayoutId,
        shouldScopeToWorkspaceSurface: false,
      }}
    >
      <PageLayoutSidePanelTabListStateProvider
        pageLayoutId={pageLayoutId}
        recordId={recordId}
        objectNameSingular={objectNameSingular}
      >
        {children}
      </PageLayoutSidePanelTabListStateProvider>
    </PageLayoutComponentInstanceContext.Provider>
  );
};
