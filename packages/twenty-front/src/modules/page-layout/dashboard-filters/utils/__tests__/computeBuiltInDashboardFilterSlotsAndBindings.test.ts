import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { BUILT_IN_DASHBOARD_FILTER_SLOT_IDS } from '@/page-layout/dashboard-filters/constants/BuiltInDashboardFilterSlotIds';
import { computeBuiltInDashboardFilterSlotsAndBindings } from '@/page-layout/dashboard-filters/utils/computeBuiltInDashboardFilterSlotsAndBindings';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { FieldMetadataType } from 'twenty-shared/types';
import { RelationType, WidgetType } from '~/generated-metadata/graphql';

const buildWidget = ({
  id,
  type = WidgetType.GRAPH,
  objectMetadataId,
}: {
  id: string;
  type?: WidgetType;
  objectMetadataId: string | null;
}) => ({ id, type, objectMetadataId }) as PageLayoutWidget;

const CREATED_AT_FIELD = {
  id: 'created-at-id',
  name: 'createdAt',
  type: FieldMetadataType.DATE_TIME,
  isActive: true,
} as FieldMetadataItem;

const ACCOUNT_OWNER_FIELD = {
  id: 'account-owner-id',
  name: 'accountOwner',
  type: FieldMetadataType.RELATION,
  isActive: true,
  relation: {
    type: RelationType.MANY_TO_ONE,
    targetObjectMetadata: { nameSingular: 'workspaceMember' },
  },
} as FieldMetadataItem;

const COMPANY_OBJECT = {
  id: 'company-object-id',
  fields: [CREATED_AT_FIELD, ACCOUNT_OWNER_FIELD],
};

const PERSON_OBJECT = {
  id: 'person-object-id',
  fields: [CREATED_AT_FIELD],
};

const OBJECT_METADATA_ITEMS = [COMPANY_OBJECT, PERSON_OBJECT];

const { DATE, OWNER } = BUILT_IN_DASHBOARD_FILTER_SLOT_IDS;

const compute = (widgets: PageLayoutWidget[]) =>
  computeBuiltInDashboardFilterSlotsAndBindings({
    widgets,
    objectMetadataItems: OBJECT_METADATA_ITEMS,
  });

describe('computeBuiltInDashboardFilterSlotsAndBindings', () => {
  it('exposes a slot once at least one chart binds it and binds every chart to it', () => {
    const { slotDefinitions, bindingsByWidgetId } = compute([
      buildWidget({ id: 'companies', objectMetadataId: COMPANY_OBJECT.id }),
      buildWidget({ id: 'people', objectMetadataId: PERSON_OBJECT.id }),
    ]);

    expect(slotDefinitions.map((slot) => slot.id)).toEqual([DATE, OWNER]);
    expect(bindingsByWidgetId).toEqual({
      companies: {
        [DATE]: { fieldMetadataId: CREATED_AT_FIELD.id },
        [OWNER]: { fieldMetadataId: ACCOUNT_OWNER_FIELD.id },
      },
      people: {
        [DATE]: { fieldMetadataId: CREATED_AT_FIELD.id },
        [OWNER]: null,
      },
    });
  });

  it('drops a slot no chart binds, along with its bindings', () => {
    const { slotDefinitions, bindingsByWidgetId } = compute([
      buildWidget({ id: 'people', objectMetadataId: PERSON_OBJECT.id }),
    ]);

    expect(slotDefinitions.map((slot) => slot.id)).toEqual([DATE]);
    expect(bindingsByWidgetId).toEqual({
      people: { [DATE]: { fieldMetadataId: CREATED_AT_FIELD.id } },
    });
  });

  it('keeps a chart whose object is missing or unknown with null bindings', () => {
    const { slotDefinitions, bindingsByWidgetId } = compute([
      buildWidget({ id: 'companies', objectMetadataId: COMPANY_OBJECT.id }),
      buildWidget({ id: 'no-object', objectMetadataId: null }),
      buildWidget({ id: 'unknown-object', objectMetadataId: 'unknown-id' }),
    ]);

    expect(slotDefinitions.map((slot) => slot.id)).toEqual([DATE, OWNER]);
    expect(bindingsByWidgetId['no-object']).toEqual({
      [DATE]: null,
      [OWNER]: null,
    });
    expect(bindingsByWidgetId['unknown-object']).toEqual({
      [DATE]: null,
      [OWNER]: null,
    });
  });

  it('ignores widgets that are not charts', () => {
    const { slotDefinitions, bindingsByWidgetId } = compute([
      buildWidget({
        id: 'table',
        type: WidgetType.RECORD_TABLE,
        objectMetadataId: COMPANY_OBJECT.id,
      }),
    ]);

    expect(slotDefinitions).toEqual([]);
    expect(bindingsByWidgetId).toEqual({});
  });

  it('has no slots on an empty dashboard', () => {
    expect(compute([])).toEqual({
      slotDefinitions: [],
      bindingsByWidgetId: {},
    });
  });
});
