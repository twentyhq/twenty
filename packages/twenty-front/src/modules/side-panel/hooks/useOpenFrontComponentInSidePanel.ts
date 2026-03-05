import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { viewableFrontComponentIdComponentState } from '@/side-panel/pages/front-component/states/viewableFrontComponentIdComponentState';
import { viewableFrontComponentRecordContextComponentState } from '@/side-panel/pages/front-component/states/viewableFrontComponentRecordContextComponentState';
import { useStore } from 'jotai';
import { SidePanelPages } from 'twenty-shared/types';
import { type IconComponent } from 'twenty-ui/display';
import { v4 } from 'uuid';

export const useOpenFrontComponentInSidePanel = () => {
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openFrontComponentInSidePanel = ({
    frontComponentId,
    pageTitle,
    pageIcon,
    resetNavigationStack = false,
    recordContext,
  }: {
    frontComponentId: string;
    pageTitle: string;
    pageIcon: IconComponent;
    resetNavigationStack?: boolean;
    recordContext?: {
      recordId: string;
      objectNameSingular: string;
    };
  }) => {
    const pageComponentInstanceId = v4();

    store.set(
      viewableFrontComponentIdComponentState.atomFamily({
        instanceId: pageComponentInstanceId,
      }),
      frontComponentId,
    );

    store.set(
      viewableFrontComponentRecordContextComponentState.atomFamily({
        instanceId: pageComponentInstanceId,
      }),
      recordContext ?? null,
    );

    navigateSidePanelMenu({
      page: SidePanelPages.ViewFrontComponent,
      pageTitle,
      pageIcon,
      pageId: pageComponentInstanceId,
      resetNavigationStack,
    });
  };

  return {
    openFrontComponentInSidePanel,
  };
};
