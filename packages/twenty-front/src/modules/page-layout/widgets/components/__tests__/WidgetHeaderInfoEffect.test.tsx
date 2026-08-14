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

const getPublishedHeaderInfo = (store: ReturnType<typeof createStore>) =>
  store.get(
    widgetHeaderInfoComponentFamilyState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      familyKey: WIDGET_ID,
    }),
  );

describe('WidgetHeaderInfoEffect', () => {
  it('publishes count and multiple actions to the widget header', () => {
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

    const publishedHeaderInfo = getPublishedHeaderInfo(store);

    expect(publishedHeaderInfo?.count).toBe(12);
    expect(publishedHeaderInfo?.actions?.map(({ id }) => id)).toEqual([
      'compose',
      'see-all',
    ]);
    expect(publishedHeaderInfo?.actions?.[1].to).toBe('/objects/tasks');
  });

  it('clears the published header info on unmount', () => {
    const store = createStore();

    const { unmount } = render(<WidgetHeaderInfoEffect count={3} />, {
      wrapper: getWrapper(store),
    });

    expect(getPublishedHeaderInfo(store)?.count).toBe(3);

    unmount();

    expect(getPublishedHeaderInfo(store)).toBeNull();
  });

  it('no-ops without throwing when rendered outside a widget', () => {
    expect(() => render(<WidgetHeaderInfoEffect count={7} />)).not.toThrow();
  });

  it('does not republish equivalent actions', () => {
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

    const firstPublishedHeaderInfo = getPublishedHeaderInfo(store);

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

    expect(getPublishedHeaderInfo(store)).toBe(firstPublishedHeaderInfo);
  });

  it('publishes the latest action callback', () => {
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

    expect(getPublishedHeaderInfo(store)?.actions?.[0].onClick).toBe(
      secondOnClick,
    );

    getPublishedHeaderInfo(store)?.actions?.[0].onClick?.();

    expect(firstOnClick).not.toHaveBeenCalled();
    expect(secondOnClick).toHaveBeenCalledTimes(1);
  });

  it('does not rerender the publisher while the header stays non-empty', () => {
    const store = createStore();
    let publisherRenderCount = 0;
    let latestOnClick = () => undefined;

    const Publisher = () => {
      publisherRenderCount++;
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

    render(<Publisher />, { wrapper: getWrapper(store) });

    expect(publisherRenderCount).toBe(2);
    expect(getPublishedHeaderInfo(store)?.actions?.[0].onClick).toBe(
      latestOnClick,
    );
  });
});
