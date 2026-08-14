import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { WidgetHeaderInfoEffect } from '@/page-layout/widgets/components/WidgetHeaderInfoEffect';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { widgetHasHeaderInfoComponentFamilySelector } from '@/page-layout/widgets/states/selectors/widgetHasHeaderInfoComponentFamilySelector';
import { widgetHeaderInfoComponentFamilyState } from '@/page-layout/widgets/states/widgetHeaderInfoComponentFamilyState';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { render } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { IconArrowUpRight, IconPlus } from 'twenty-ui/icon';

const WIDGET_ID = 'widget-under-test';

const getWrapper =
  (store: ReturnType<typeof createStore>) =>
  ({ children }: { children: ReactNode }) => (
    <PageLayoutTestWrapper
      store={store}
      instanceId={PAGE_LAYOUT_TEST_INSTANCE_ID}
    >
      <WidgetComponentInstanceContext.Provider
        value={{ instanceId: WIDGET_ID }}
      >
        {children}
      </WidgetComponentInstanceContext.Provider>
    </PageLayoutTestWrapper>
  );

const getStoredWidgetHeaderInfo = (store: ReturnType<typeof createStore>) =>
  store.get(
    widgetHeaderInfoComponentFamilyState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      familyKey: WIDGET_ID,
    }),
  );

describe('WidgetHeaderInfoEffect', () => {
  it('syncs count and multiple actions to the widget header state', () => {
    const store = createStore();

    render(
      <WidgetHeaderInfoEffect
        count={12}
        actions={[
          {
            id: 'compose',
            Icon: IconPlus,
            label: 'Compose',
            onClick: jest.fn(),
          },
          {
            id: 'see-all',
            Icon: IconArrowUpRight,
            label: 'See all',
            to: '/objects/tasks',
          },
        ]}
      />,
      { wrapper: getWrapper(store) },
    );

    const storedWidgetHeaderInfo = getStoredWidgetHeaderInfo(store);

    expect(storedWidgetHeaderInfo?.count).toBe(12);
    expect(storedWidgetHeaderInfo?.actions?.map(({ id }) => id)).toEqual([
      'compose',
      'see-all',
    ]);
    expect(storedWidgetHeaderInfo?.actions?.[1].to).toBe('/objects/tasks');
  });

  it('clears the widget header state on unmount', () => {
    const store = createStore();

    const { unmount } = render(<WidgetHeaderInfoEffect count={3} />, {
      wrapper: getWrapper(store),
    });

    expect(getStoredWidgetHeaderInfo(store)?.count).toBe(3);

    unmount();

    expect(getStoredWidgetHeaderInfo(store)).toBeNull();
  });

  it('no-ops without throwing when rendered outside a widget', () => {
    expect(() => render(<WidgetHeaderInfoEffect count={7} />)).not.toThrow();
  });

  it('does not re-sync equivalent actions', () => {
    const store = createStore();
    const onClick = jest.fn();

    const { rerender } = render(
      <WidgetHeaderInfoEffect
        count={5}
        actions={[
          {
            id: 'new-task',
            Icon: IconPlus,
            label: 'New task',
            onClick,
          },
        ]}
      />,
      { wrapper: getWrapper(store) },
    );

    const firstStoredWidgetHeaderInfo = getStoredWidgetHeaderInfo(store);

    rerender(
      <WidgetHeaderInfoEffect
        count={5}
        actions={[
          {
            id: 'new-task',
            Icon: IconPlus,
            label: 'New task',
            onClick,
          },
        ]}
      />,
    );

    expect(getStoredWidgetHeaderInfo(store)).toBe(firstStoredWidgetHeaderInfo);
  });

  it('syncs the latest action callback', () => {
    const store = createStore();
    const firstOnClick = jest.fn();
    const secondOnClick = jest.fn();

    const { rerender } = render(
      <WidgetHeaderInfoEffect
        actions={[
          {
            id: 'compose',
            Icon: IconPlus,
            label: 'Compose',
            onClick: firstOnClick,
          },
        ]}
      />,
      { wrapper: getWrapper(store) },
    );

    rerender(
      <WidgetHeaderInfoEffect
        actions={[
          {
            id: 'compose',
            Icon: IconPlus,
            label: 'Compose',
            onClick: secondOnClick,
          },
        ]}
      />,
    );

    expect(getStoredWidgetHeaderInfo(store)?.actions?.[0].onClick).toBe(
      secondOnClick,
    );

    getStoredWidgetHeaderInfo(store)?.actions?.[0].onClick?.();

    expect(firstOnClick).not.toHaveBeenCalled();
    expect(secondOnClick).toHaveBeenCalledTimes(1);
  });

  it('does not rerender the widget content while the header stays non-empty', () => {
    const store = createStore();
    let widgetContentRenderCount = 0;
    let latestOnClick = () => undefined;

    const WidgetContent = () => {
      widgetContentRenderCount++;
      latestOnClick = () => undefined;

      useAtomComponentFamilySelectorValue(
        widgetHasHeaderInfoComponentFamilySelector,
        WIDGET_ID,
      );

      return (
        <WidgetHeaderInfoEffect
          actions={[
            {
              id: 'compose',
              Icon: IconPlus,
              label: 'Compose',
              onClick: latestOnClick,
            },
          ]}
        />
      );
    };

    render(<WidgetContent />, { wrapper: getWrapper(store) });

    expect(widgetContentRenderCount).toBe(2);
    expect(getStoredWidgetHeaderInfo(store)?.actions?.[0].onClick).toBe(
      latestOnClick,
    );
  });
});
