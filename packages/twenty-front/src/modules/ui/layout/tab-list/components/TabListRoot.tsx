import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { Tabs } from 'twenty-ui/primitives/navigation';

import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const StyledRoot = styled(Tabs.Root)`
  // Preserve the parent's sizing context regardless of the primitive's CSS load order.
  && {
    display: contents;
  }
`;

type TabListRootProps = {
  componentInstanceId: string;
  children: ReactNode;
  enabled?: boolean;
};

export const TabListRoot = ({
  componentInstanceId,
  children,
  enabled = true,
}: TabListRootProps) => {
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    componentInstanceId,
  );

  return (
    <TabListComponentInstanceContext.Provider
      value={{ instanceId: componentInstanceId }}
    >
      {enabled ? (
        <StyledRoot value={activeTabId}>{children}</StyledRoot>
      ) : (
        children
      )}
    </TabListComponentInstanceContext.Provider>
  );
};
