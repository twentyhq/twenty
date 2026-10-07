import { findMissingRequiredDashboardFilterSlot } from '@/page-layout/dashboard-filters/utils/findMissingRequiredDashboardFilterSlot';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { WidgetType } from '~/generated-metadata/graphql';

const REQUIRED_SLOT: DashboardFilterSlot = {
  id: 'region',
  label: 'Region',
  filterType: 'SELECT',
  isRequired: true,
};

const OPTIONAL_SLOT: DashboardFilterSlot = {
  id: 'owner',
  label: 'Owner',
  filterType: 'RELATION',
};

const BINDINGS: Record<string, DashboardFilterBinding | null> = {
  [REQUIRED_SLOT.id]: { fieldMetadataId: 'region-field-id' },
  [OPTIONAL_SLOT.id]: { fieldMetadataId: 'owner-field-id' },
};

const REGION_VALUE = {
  operand: ViewFilterOperand.IS,
  value: JSON.stringify(['EMEA']),
};

describe('findMissingRequiredDashboardFilterSlot', () => {
  it('returns the required slot when it is bound and unset', () => {
    expect(
      findMissingRequiredDashboardFilterSlot({
        widget: { type: WidgetType.GRAPH },
        slots: [OPTIONAL_SLOT, REQUIRED_SLOT],
        values: {},
        bindings: BINDINGS,
      }),
    ).toEqual(REQUIRED_SLOT);
  });

  it('returns null once the required slot has a value', () => {
    expect(
      findMissingRequiredDashboardFilterSlot({
        widget: { type: WidgetType.GRAPH },
        slots: [REQUIRED_SLOT],
        values: { [REQUIRED_SLOT.id]: REGION_VALUE },
        bindings: BINDINGS,
      }),
    ).toBeNull();
  });

  it('returns null when the widget is not bound to the required slot', () => {
    expect(
      findMissingRequiredDashboardFilterSlot({
        widget: { type: WidgetType.GRAPH },
        slots: [REQUIRED_SLOT],
        values: {},
        bindings: { [REQUIRED_SLOT.id]: null },
      }),
    ).toBeNull();
    expect(
      findMissingRequiredDashboardFilterSlot({
        widget: { type: WidgetType.GRAPH },
        slots: [REQUIRED_SLOT],
        values: {},
        bindings: undefined,
      }),
    ).toBeNull();
  });

  it('returns null when no bound slot is required', () => {
    expect(
      findMissingRequiredDashboardFilterSlot({
        widget: { type: WidgetType.GRAPH },
        slots: [OPTIONAL_SLOT],
        values: {},
        bindings: BINDINGS,
      }),
    ).toBeNull();
  });

  it('treats a required slot whose value would not filter as unset', () => {
    expect(
      findMissingRequiredDashboardFilterSlot({
        widget: { type: WidgetType.GRAPH },
        slots: [REQUIRED_SLOT],
        values: {
          [REQUIRED_SLOT.id]: { operand: ViewFilterOperand.IS, value: '[]' },
        },
        bindings: BINDINGS,
      }),
    ).toEqual(REQUIRED_SLOT);
  });

  it('never blocks a non-chart widget', () => {
    expect(
      findMissingRequiredDashboardFilterSlot({
        widget: { type: WidgetType.IFRAME },
        slots: [REQUIRED_SLOT],
        values: {},
        bindings: BINDINGS,
      }),
    ).toBeNull();
  });
});
