import { render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type CommandMenuCoreObjectName } from 'twenty-shared/types';

import { RouteContextStoreCoreObjectNameEffect } from '@/context-store/components/RouteContextStoreCoreObjectNameEffect';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentCoreObjectNameComponentState } from '@/context-store/states/contextStoreCurrentCoreObjectNameComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

const getMainContextStoreCoreObjectName = () =>
  jotaiStore.get(
    contextStoreCurrentCoreObjectNameComponentState.atomFamily({
      instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    }),
  );

const renderEffect = (coreObjectName: CommandMenuCoreObjectName | null) => (
  <JotaiProvider store={jotaiStore}>
    <RouteContextStoreCoreObjectNameEffect coreObjectName={coreObjectName} />
  </JotaiProvider>
);

describe('RouteContextStoreCoreObjectNameEffect', () => {
  it('clears the core object when leaving a workflow page', () => {
    const { rerender } = render(renderEffect('workflow'));

    expect(getMainContextStoreCoreObjectName()).toBe('workflow');

    rerender(renderEffect(null));

    expect(getMainContextStoreCoreObjectName()).toBeNull();
  });
});
