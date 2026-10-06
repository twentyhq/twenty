import { computePersistedDashboardFilterSlotsAndBindings } from '@/page-layout/dashboard-filters/utils/computePersistedDashboardFilterSlotsAndBindings';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  type DashboardFilterBindingsBySlotId,
  type DashboardFilterSlot,
} from 'twenty-shared/types';
import { WidgetType } from '~/generated-metadata/graphql';

const DATE_SLOT: DashboardFilterSlot = {
  id: 'date',
  label: 'Date',
  filterType: 'DATE_TIME',
};

const OWNER_SLOT: DashboardFilterSlot = {
  id: 'owner',
  label: 'Owner',
  filterType: 'RELATION',
};

const buildChartWidget = ({
  id,
  dashboardFilterBindings,
}: {
  id: string;
  dashboardFilterBindings?: DashboardFilterBindingsBySlotId | null;
}) =>
  ({
    id,
    type: WidgetType.GRAPH,
    configuration: {
      __typename: 'BarChartConfiguration',
      ...(dashboardFilterBindings === undefined
        ? {}
        : { dashboardFilterBindings }),
    },
  }) as PageLayoutWidget;

describe('computePersistedDashboardFilterSlotsAndBindings', () => {
  it('exposes the persisted slots with each chart binding, reading a missing key or null as not applied', () => {
    const { slotDefinitions, bindingsByWidgetId } =
      computePersistedDashboardFilterSlotsAndBindings({
        slots: [DATE_SLOT, OWNER_SLOT],
        widgets: [
          buildChartWidget({
            id: 'companies',
            dashboardFilterBindings: {
              date: { fieldMetadataId: 'company-created-at' },
              owner: { fieldMetadataId: 'company-account-owner' },
            },
          }),
          buildChartWidget({
            id: 'people',
            dashboardFilterBindings: {
              date: { fieldMetadataId: 'person-created-at' },
              owner: null,
            },
          }),
          buildChartWidget({ id: 'legacy' }),
        ],
      });

    expect(slotDefinitions).toEqual([DATE_SLOT, OWNER_SLOT]);
    expect(bindingsByWidgetId).toEqual({
      companies: {
        date: { fieldMetadataId: 'company-created-at' },
        owner: { fieldMetadataId: 'company-account-owner' },
      },
      people: {
        date: { fieldMetadataId: 'person-created-at' },
        owner: null,
      },
      legacy: { date: null, owner: null },
    });
  });

  it('drops a persisted slot no chart binds, along with its bindings', () => {
    const { slotDefinitions, bindingsByWidgetId } =
      computePersistedDashboardFilterSlotsAndBindings({
        slots: [DATE_SLOT, OWNER_SLOT],
        widgets: [
          buildChartWidget({
            id: 'companies',
            dashboardFilterBindings: {
              date: { fieldMetadataId: 'company-created-at' },
              owner: null,
            },
          }),
        ],
      });

    expect(slotDefinitions).toEqual([DATE_SLOT]);
    expect(bindingsByWidgetId).toEqual({
      companies: { date: { fieldMetadataId: 'company-created-at' } },
    });
  });

  it('ignores bindings to slots the layout no longer has', () => {
    const { slotDefinitions, bindingsByWidgetId } =
      computePersistedDashboardFilterSlotsAndBindings({
        slots: [DATE_SLOT],
        widgets: [
          buildChartWidget({
            id: 'companies',
            dashboardFilterBindings: {
              date: { fieldMetadataId: 'company-created-at' },
              removed: { fieldMetadataId: 'company-stage' },
            },
          }),
        ],
      });

    expect(slotDefinitions).toEqual([DATE_SLOT]);
    expect(bindingsByWidgetId).toEqual({
      companies: { date: { fieldMetadataId: 'company-created-at' } },
    });
  });

  it('only considers chart widgets', () => {
    const { slotDefinitions, bindingsByWidgetId } =
      computePersistedDashboardFilterSlotsAndBindings({
        slots: [DATE_SLOT],
        widgets: [
          {
            id: 'iframe',
            type: WidgetType.IFRAME,
            configuration: {
              __typename: 'IframeConfiguration',
              dashboardFilterBindings: {
                date: { fieldMetadataId: 'nope' },
              },
            },
          } as unknown as PageLayoutWidget,
        ],
      });

    expect(slotDefinitions).toEqual([]);
    expect(bindingsByWidgetId).toEqual({});
  });

  it('returns nothing for a layout without slots', () => {
    expect(
      computePersistedDashboardFilterSlotsAndBindings({
        slots: [],
        widgets: [
          buildChartWidget({
            id: 'companies',
            dashboardFilterBindings: {
              date: { fieldMetadataId: 'company-created-at' },
            },
          }),
        ],
      }),
    ).toEqual({
      slotDefinitions: [],
      bindingsByWidgetId: { companies: {} },
    });
  });
});
