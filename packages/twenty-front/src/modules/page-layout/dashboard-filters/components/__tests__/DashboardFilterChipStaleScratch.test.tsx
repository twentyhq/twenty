import { DashboardFilterBar } from '@/page-layout/dashboard-filters/components/DashboardFilterBar';
import { dashboardFilterCrossFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterCrossFilterValuesComponentState';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { makeTab } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { buildDefaultBarChartConfiguration } from '@/page-layout/utils/buildDefaultBarChartConfiguration';
import { buildDraftPageLayoutWidget } from '@/page-layout/utils/buildDraftPageLayoutWidget';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import {
  type DashboardFilterSlot,
  type DashboardFilterValue,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ThemeProvider } from 'twenty-ui/theme';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const companyNameField = companyObjectMetadataItem.fields.find(
  (field) => field.name === 'name',
);

if (!isDefined(companyNameField)) {
  throw new Error('Expected the company mock to have a name field');
}

const COMPANY_NAME_SLOT: DashboardFilterSlot = {
  id: 'company-name-slot',
  label: 'Company name',
  filterType: 'TEXT',
  defaultOperand: ViewFilterOperand.CONTAINS,
};

const ACME_VALUE: DashboardFilterValue = {
  operand: ViewFilterOperand.CONTAINS,
  value: 'Acme',
};

const companyChartWidget = buildDraftPageLayoutWidget({
  id: 'company-widget',
  pageLayoutTabId: 'tab-1',
  title: 'Companies',
  type: WidgetType.GRAPH,
  configuration: {
    ...buildDefaultBarChartConfiguration({}),
    dashboardFilterBindings: {
      [COMPANY_NAME_SLOT.id]: { fieldMetadataId: companyNameField.id },
    },
  },
  position: {
    layoutMode: PageLayoutTabLayoutMode.GRID,
    row: 0,
    column: 0,
    rowSpan: 2,
    columnSpan: 2,
  },
  objectMetadataId: companyObjectMetadataItem.id,
});

const dashboardFilterValuesAtom =
  dashboardFilterValuesComponentState.atomFamily({
    instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
  });

const dashboardFilterCrossFilterValuesAtom =
  dashboardFilterCrossFilterValuesComponentState.atomFamily({
    instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
  });

const renderDashboardFilterBar = async () => {
  resetJotaiStore();

  jotaiStore.set(
    pageLayoutPersistedComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    {
      id: PAGE_LAYOUT_TEST_INSTANCE_ID,
      name: 'Dashboard',
      type: PageLayoutType.DASHBOARD,
      objectMetadataId: null,
      dashboardFilters: [COMPANY_NAME_SLOT],
      tabs: [
        makeTab('tab-1', [companyChartWidget], 0, PageLayoutTabLayoutMode.GRID),
      ],
    } as PageLayout,
  );

  render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider colorScheme="light">
        <JotaiProvider store={jotaiStore}>
          <MemoryRouter initialEntries={['/']}>
            <JestObjectMetadataItemSetter>
              <PageLayoutTestWrapper
                store={jotaiStore}
                layoutType={PageLayoutType.DASHBOARD}
              >
                <DashboardFilterBar />
                <div data-testid="metadata-loaded" />
              </PageLayoutTestWrapper>
            </JestObjectMetadataItemSetter>
          </MemoryRouter>
        </JotaiProvider>
      </ThemeProvider>
    </I18nProvider>,
  );

  await screen.findByTestId('metadata-loaded');
};

// Picks a value through the chip and closes it, the way a viewer leaves a chip's scratch filter behind.
const pickAcmeThroughChip = async () => {
  const user = userEvent.setup();

  await user.click(screen.getByText('Company name'));
  await user.type(await screen.findByPlaceholderText('Name'), 'Acme');

  await waitFor(() =>
    expect(
      jotaiStore.get(dashboardFilterValuesAtom)[COMPANY_NAME_SLOT.id],
    ).toEqual(ACME_VALUE),
  );

  await user.keyboard('{Escape}');

  return user;
};

describe('DashboardFilter chip after the viewer edited a slot through it', () => {
  it('lets Reset clear the slot instead of replaying the chip value', async () => {
    await renderDashboardFilterBar();

    const user = await pickAcmeThroughChip();

    await user.click(await screen.findByRole('button', { name: 'Reset' }));

    await waitFor(() =>
      expect(jotaiStore.get(dashboardFilterValuesAtom)).toEqual({}),
    );
    expect(jotaiStore.get(dashboardFilterValuesAtom)).toEqual({});
  });

  it('keeps a later cross-filter on that slot together with its marker', async () => {
    await renderDashboardFilterBar();

    await pickAcmeThroughChip();

    const crossFilterValue: DashboardFilterValue = {
      operand: ViewFilterOperand.CONTAINS,
      value: 'Globex',
    };

    act(() => {
      jotaiStore.set(dashboardFilterValuesAtom, {
        [COMPANY_NAME_SLOT.id]: crossFilterValue,
      });
      jotaiStore.set(dashboardFilterCrossFilterValuesAtom, {
        [COMPANY_NAME_SLOT.id]: crossFilterValue,
      });
    });

    expect(
      jotaiStore.get(dashboardFilterValuesAtom)[COMPANY_NAME_SLOT.id],
    ).toEqual(crossFilterValue);
    expect(
      jotaiStore.get(dashboardFilterCrossFilterValuesAtom)[
        COMPANY_NAME_SLOT.id
      ],
    ).toEqual(crossFilterValue);
  });

  it('still clears the slot when the chip is closed on an emptied input', async () => {
    await renderDashboardFilterBar();

    const user = await pickAcmeThroughChip();

    await user.click(screen.getByText('Company name'));
    await user.clear(await screen.findByPlaceholderText('Name'));
    await user.keyboard('{Escape}');

    await waitFor(() =>
      expect(jotaiStore.get(dashboardFilterValuesAtom)).toEqual({}),
    );
  });
});
