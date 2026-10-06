import { DashboardFilterUrlSyncEffect } from '@/page-layout/dashboard-filters/components/DashboardFilterUrlSyncEffect';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { PageLayoutTestWrapper } from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { act, render, screen, waitFor } from '@testing-library/react';
import { createStore } from 'jotai';
import { MemoryRouter, useLocation } from 'react-router-dom';
import {
  type DashboardFilterSlot,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { PageLayoutType } from '~/generated-metadata/graphql';

const DATE_SLOT: DashboardFilterSlot = {
  id: 'built-in-date',
  label: 'Date',
  filterType: 'DATE_TIME',
};

const PAGE_LAYOUT_A_ID = 'page-layout-a';
const PAGE_LAYOUT_B_ID = 'page-layout-b';
const PAGE_LAYOUT_A_INSTANCE_ID = 'page-layout-a-instance';
const PAGE_LAYOUT_B_INSTANCE_ID = 'page-layout-b-instance';

const UrlSearchProbe = () => {
  const { search } = useLocation();

  return <div data-testid="url-search">{search}</div>;
};

const getUrlSearchParams = () =>
  new URLSearchParams(screen.getByTestId('url-search').textContent ?? '');

describe('DashboardFilterUrlSyncEffect', () => {
  it('seeds values from its own URL namespace, mirrors changes and leaves other dashboards alone', async () => {
    const store = createStore();

    render(
      <MemoryRouter
        initialEntries={[
          `/dashboards?viewId=abc&dashboardFilter[${PAGE_LAYOUT_A_ID}][built-in-date][operand]=IS_TODAY&dashboardFilter[${PAGE_LAYOUT_A_ID}][built-in-date][value]=`,
        ]}
      >
        <PageLayoutTestWrapper
          store={store}
          instanceId={PAGE_LAYOUT_A_INSTANCE_ID}
          layoutType={PageLayoutType.STANDALONE_PAGE}
        >
          <DashboardFilterUrlSyncEffect
            pageLayoutId={PAGE_LAYOUT_A_ID}
            slots={[DATE_SLOT]}
          />
        </PageLayoutTestWrapper>
        <PageLayoutTestWrapper
          store={store}
          instanceId={PAGE_LAYOUT_B_INSTANCE_ID}
          layoutType={PageLayoutType.STANDALONE_PAGE}
        >
          <DashboardFilterUrlSyncEffect
            pageLayoutId={PAGE_LAYOUT_B_ID}
            slots={[DATE_SLOT]}
          />
        </PageLayoutTestWrapper>
        <UrlSearchProbe />
      </MemoryRouter>,
    );

    const valuesAtom = (instanceId: string) =>
      dashboardFilterValuesComponentState.atomFamily({ instanceId });

    await waitFor(() => {
      expect(store.get(valuesAtom(PAGE_LAYOUT_A_INSTANCE_ID))).toEqual({
        'built-in-date': { operand: ViewFilterOperand.IS_TODAY, value: '' },
      });
    });
    expect(store.get(valuesAtom(PAGE_LAYOUT_B_INSTANCE_ID))).toEqual({});
    expect(
      getUrlSearchParams().get(
        `dashboardFilter[${PAGE_LAYOUT_A_ID}][built-in-date][operand]`,
      ),
    ).toBe('IS_TODAY');

    act(() => {
      store.set(valuesAtom(PAGE_LAYOUT_B_INSTANCE_ID), {
        'built-in-date': { operand: ViewFilterOperand.IS_IN_FUTURE, value: '' },
      });
    });

    await waitFor(() => {
      expect(
        getUrlSearchParams().get(
          `dashboardFilter[${PAGE_LAYOUT_B_ID}][built-in-date][operand]`,
        ),
      ).toBe('IS_IN_FUTURE');
    });
    expect(
      getUrlSearchParams().get(
        `dashboardFilter[${PAGE_LAYOUT_A_ID}][built-in-date][operand]`,
      ),
    ).toBe('IS_TODAY');
    expect(store.get(valuesAtom(PAGE_LAYOUT_A_INSTANCE_ID))).toEqual({
      'built-in-date': { operand: ViewFilterOperand.IS_TODAY, value: '' },
    });

    act(() => {
      store.set(valuesAtom(PAGE_LAYOUT_A_INSTANCE_ID), {});
    });

    await waitFor(() => {
      expect(
        getUrlSearchParams().has(
          `dashboardFilter[${PAGE_LAYOUT_A_ID}][built-in-date][operand]`,
        ),
      ).toBe(false);
    });
    expect(
      getUrlSearchParams().has(
        `dashboardFilter[${PAGE_LAYOUT_A_ID}][built-in-date][value]`,
      ),
    ).toBe(false);
    expect(getUrlSearchParams().get('viewId')).toBe('abc');
    expect(
      getUrlSearchParams().get(
        `dashboardFilter[${PAGE_LAYOUT_B_ID}][built-in-date][operand]`,
      ),
    ).toBe('IS_IN_FUTURE');
  });

  it('replaces stale in-memory values with what the URL holds on mount', async () => {
    const store = createStore();

    store.set(
      dashboardFilterValuesComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_A_INSTANCE_ID,
      }),
      {
        'built-in-date': { operand: ViewFilterOperand.IS_IN_PAST, value: '' },
      },
    );

    render(
      <MemoryRouter initialEntries={['/dashboards?viewId=abc']}>
        <PageLayoutTestWrapper
          store={store}
          instanceId={PAGE_LAYOUT_A_INSTANCE_ID}
          layoutType={PageLayoutType.STANDALONE_PAGE}
        >
          <DashboardFilterUrlSyncEffect
            pageLayoutId={PAGE_LAYOUT_A_ID}
            slots={[DATE_SLOT]}
          />
        </PageLayoutTestWrapper>
        <UrlSearchProbe />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        store.get(
          dashboardFilterValuesComponentState.atomFamily({
            instanceId: PAGE_LAYOUT_A_INSTANCE_ID,
          }),
        ),
      ).toEqual({});
    });
    expect(screen.getByTestId('url-search').textContent).toBe('?viewId=abc');
  });
});
