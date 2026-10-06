import {
  COMPANY_ACCOUNT_OWNER,
  COMPANY_CREATED_AT,
  COMPANY_NAME,
  COMPANY_OBJECT_ID,
  OBJECT_METADATA_ITEMS,
  OPPORTUNITY_ASSIGNEE,
  OPPORTUNITY_OBJECT_ID,
  PERSON_CREATED_AT,
  PERSON_OBJECT_ID,
  buildChartWidget,
} from '@/page-layout/dashboard-filters/testing/dashboardFilterTestFixtures';
import { autoBindDashboardFilterSlotToWidget } from '@/page-layout/dashboard-filters/utils/autoBindDashboardFilterSlotToWidget';
import { buildAutoDashboardFilterBindingsForNewWidget } from '@/page-layout/dashboard-filters/utils/buildAutoDashboardFilterBindingsForNewWidget';
import { type DashboardFilterSlot } from 'twenty-shared/types';

const DATE_SLOT: DashboardFilterSlot = {
  id: 'date-slot',
  label: 'Date',
  filterType: 'DATE_TIME',
};
const OWNER_SLOT: DashboardFilterSlot = {
  id: 'owner-slot',
  label: 'Owner',
  filterType: 'RELATION',
};
const NAME_SLOT: DashboardFilterSlot = {
  id: 'name-slot',
  label: 'Name',
  filterType: 'TEXT',
};

const COMPANY_CHART = buildChartWidget({
  id: 'companies',
  objectMetadataId: COMPANY_OBJECT_ID,
  dashboardFilterBindings: {
    [DATE_SLOT.id]: { fieldMetadataId: COMPANY_CREATED_AT.id },
    [OWNER_SLOT.id]: { fieldMetadataId: COMPANY_ACCOUNT_OWNER.id },
    [NAME_SLOT.id]: { fieldMetadataId: COMPANY_NAME.id },
  },
});

const autoBind = (slot: DashboardFilterSlot, widgetObjectMetadataId: string) =>
  autoBindDashboardFilterSlotToWidget({
    slot,
    widgetObjectMetadataId,
    existingWidgets: [COMPANY_CHART],
    objectMetadataItems: OBJECT_METADATA_ITEMS,
  });

describe('autoBindDashboardFilterSlotToWidget', () => {
  it('binds the field with the same name and type as another chart binding', () => {
    expect(autoBind(DATE_SLOT, PERSON_OBJECT_ID)).toEqual({
      fieldMetadataId: PERSON_CREATED_AT.id,
    });
  });

  it('binds a relation to the same target object whatever its name', () => {
    expect(autoBind(OWNER_SLOT, OPPORTUNITY_OBJECT_ID)).toEqual({
      fieldMetadataId: OPPORTUNITY_ASSIGNEE.id,
    });
  });

  it('returns null when the new object has nothing matching', () => {
    expect(autoBind(NAME_SLOT, PERSON_OBJECT_ID)).toBeNull();
    expect(autoBind(OWNER_SLOT, PERSON_OBJECT_ID)).toBeNull();
  });

  it('returns null when no chart binds the slot yet', () => {
    expect(
      autoBindDashboardFilterSlotToWidget({
        slot: DATE_SLOT,
        widgetObjectMetadataId: PERSON_OBJECT_ID,
        existingWidgets: [
          buildChartWidget({
            id: 'unbound',
            objectMetadataId: COMPANY_OBJECT_ID,
            dashboardFilterBindings: { [DATE_SLOT.id]: null },
          }),
        ],
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toBeNull();
  });

  it('returns null for a widget without a known object', () => {
    expect(autoBind(DATE_SLOT, 'unknown-object')).toBeNull();
  });

  it('skips bindings whose field no longer exists and tries the next chart', () => {
    expect(
      autoBindDashboardFilterSlotToWidget({
        slot: DATE_SLOT,
        widgetObjectMetadataId: PERSON_OBJECT_ID,
        existingWidgets: [
          buildChartWidget({
            id: 'stale',
            objectMetadataId: COMPANY_OBJECT_ID,
            dashboardFilterBindings: {
              [DATE_SLOT.id]: { fieldMetadataId: 'deleted-field' },
            },
          }),
          COMPANY_CHART,
        ],
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toEqual({ fieldMetadataId: PERSON_CREATED_AT.id });
  });

  it('carries the relation target over when the binding traverses the relation', () => {
    expect(
      autoBindDashboardFilterSlotToWidget({
        slot: OWNER_SLOT,
        widgetObjectMetadataId: OPPORTUNITY_OBJECT_ID,
        existingWidgets: [
          buildChartWidget({
            id: 'companies',
            objectMetadataId: COMPANY_OBJECT_ID,
            dashboardFilterBindings: {
              [OWNER_SLOT.id]: {
                fieldMetadataId: COMPANY_ACCOUNT_OWNER.id,
                relationTargetFieldMetadataId: 'workspace-member-created-at',
              },
            },
          }),
        ],
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toEqual({
      fieldMetadataId: OPPORTUNITY_ASSIGNEE.id,
      relationTargetFieldMetadataId: 'workspace-member-created-at',
    });
  });
});

describe('buildAutoDashboardFilterBindingsForNewWidget', () => {
  it('writes a binding or an explicit null for every slot', () => {
    expect(
      buildAutoDashboardFilterBindingsForNewWidget({
        slots: [DATE_SLOT, OWNER_SLOT, NAME_SLOT],
        widgetObjectMetadataId: PERSON_OBJECT_ID,
        existingWidgets: [COMPANY_CHART],
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toEqual({
      [DATE_SLOT.id]: { fieldMetadataId: PERSON_CREATED_AT.id },
      [OWNER_SLOT.id]: null,
      [NAME_SLOT.id]: null,
    });
  });
});
