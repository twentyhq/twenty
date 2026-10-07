import { type DashboardFilterCandidateDimension } from '@/page-layout/dashboard-filters/types/DashboardFilterCandidateDimension';
import { autoBindDashboardFilterSlot } from '@/page-layout/dashboard-filters/utils/autoBindDashboardFilterSlot';
import { ViewFilterOperand } from 'twenty-shared/types';

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const TEXT_DIMENSION: DashboardFilterCandidateDimension = {
  key: 'field:name:TEXT',
  label: 'Name',
  icon: 'IconAbc',
  filterType: 'TEXT',
  proposedBindingsByWidgetId: {
    'company-widget': { fieldMetadataId: 'company-name-field-id' },
    'opportunity-widget': { fieldMetadataId: 'opportunity-name-field-id' },
  },
};

const DATE_DIMENSION: DashboardFilterCandidateDimension = {
  key: 'field:createdAt:DATE_TIME',
  label: 'Creation date',
  icon: 'IconCalendar',
  filterType: 'DATE_TIME',
  proposedBindingsByWidgetId: {
    'company-widget': { fieldMetadataId: 'company-created-at-field-id' },
  },
};

describe('autoBindDashboardFilterSlot', () => {
  it('turns a dimension into a slot with the first operand of its type and the proposed bindings', () => {
    expect(
      autoBindDashboardFilterSlot({
        dimension: TEXT_DIMENSION,
        slotId: 'slot-1',
      }),
    ).toEqual({
      slot: {
        id: 'slot-1',
        label: 'Name',
        filterType: 'TEXT',
        defaultOperand: ViewFilterOperand.CONTAINS,
        isRequired: false,
      },
      bindingsByWidgetId: TEXT_DIMENSION.proposedBindingsByWidgetId,
    });
  });

  it('sets no default value', () => {
    const { slot } = autoBindDashboardFilterSlot({
      dimension: DATE_DIMENSION,
      slotId: 'slot-1',
    });

    expect(slot.defaultOperand).toBe(ViewFilterOperand.IS);
    expect(slot).not.toHaveProperty('defaultValue');
  });

  it('generates a v4 uuid when no slot id is given', () => {
    const { slot } = autoBindDashboardFilterSlot({ dimension: TEXT_DIMENSION });

    expect(slot.id).toMatch(UUID_V4_PATTERN);
  });
});
