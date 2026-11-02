import { render } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { PageCommandEffect } from '@/command-menu-item/page-command/components/PageCommandEffect';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStorePageCommandsComponentState } from '@/context-store/states/contextStorePageCommandsComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { EngineComponentKey } from '~/generated-metadata/graphql';

const renderPageCommands = (pageCommands: ReactNode) => {
  const store = createStore();

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <ContextStoreComponentInstanceContext.Provider
        value={{ instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID }}
      >
        {children}
      </ContextStoreComponentInstanceContext.Provider>
    </JotaiProvider>
  );

  const { rerender, unmount } = render(pageCommands, { wrapper: Wrapper });

  const getPageCommands = () =>
    store.get(
      contextStorePageCommandsComponentState.atomFamily({
        instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
    );

  return { rerender, unmount, getPageCommands };
};

describe('PageCommandEffect', () => {
  it('offers the command only while the page renders it', () => {
    const { unmount, getPageCommands } = renderPageCommands(
      <PageCommandEffect
        engineComponentKey={EngineComponentKey.SAVE_PAGE}
        onRun={jest.fn()}
      />,
    );

    expect(Object.keys(getPageCommands())).toEqual([
      EngineComponentKey.SAVE_PAGE,
    ]);

    unmount();

    expect(getPageCommands()).toEqual({});
  });

  it('runs the latest handler the page passed', async () => {
    const firstHandler = jest.fn();
    const latestHandler = jest.fn();

    const { rerender, getPageCommands } = renderPageCommands(
      <PageCommandEffect
        engineComponentKey={EngineComponentKey.SAVE_PAGE}
        onRun={firstHandler}
      />,
    );

    rerender(
      <PageCommandEffect
        engineComponentKey={EngineComponentKey.SAVE_PAGE}
        onRun={latestHandler}
      />,
    );

    await getPageCommands()[EngineComponentKey.SAVE_PAGE]?.run();

    expect(firstHandler).not.toHaveBeenCalled();
    expect(latestHandler).toHaveBeenCalledTimes(1);
  });

  it('reflects whether the page can run the command right now', () => {
    const { rerender, getPageCommands } = renderPageCommands(
      <PageCommandEffect
        engineComponentKey={EngineComponentKey.INSTALL_APPLICATION}
        onRun={jest.fn()}
      />,
    );

    rerender(
      <PageCommandEffect
        engineComponentKey={EngineComponentKey.INSTALL_APPLICATION}
        onRun={jest.fn()}
        isDisabled
        isLoading
        progress={40}
      />,
    );

    expect(
      getPageCommands()[EngineComponentKey.INSTALL_APPLICATION],
    ).toMatchObject({ isDisabled: true, isLoading: true, progress: 40 });
  });

  it('keeps the command a newer page registered when an older page unmounts', async () => {
    const olderPageHandler = jest.fn();
    const newerPageHandler = jest.fn();

    const { rerender, getPageCommands } = renderPageCommands(
      <>
        <PageCommandEffect
          key="older-page"
          engineComponentKey={EngineComponentKey.SAVE_PAGE}
          onRun={olderPageHandler}
        />
        <PageCommandEffect
          key="newer-page"
          engineComponentKey={EngineComponentKey.SAVE_PAGE}
          onRun={newerPageHandler}
        />
      </>,
    );

    rerender(
      <PageCommandEffect
        key="newer-page"
        engineComponentKey={EngineComponentKey.SAVE_PAGE}
        onRun={newerPageHandler}
      />,
    );

    await getPageCommands()[EngineComponentKey.SAVE_PAGE]?.run();

    expect(olderPageHandler).not.toHaveBeenCalled();
    expect(newerPageHandler).toHaveBeenCalledTimes(1);
  });
});
