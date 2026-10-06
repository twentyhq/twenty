import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import {
  makeDraft,
  makeTab,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  type DashboardFilterBindingsBySlotId,
  type DashboardFilterSlot,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  PageLayoutType,
  RelationType,
  WidgetType,
} from '~/generated-metadata/graphql';

export const WORKSPACE_MEMBER_OBJECT_ID = 'workspace-member-object-id';
export const COMPANY_OBJECT_ID = 'company-object-id';
export const PERSON_OBJECT_ID = 'person-object-id';
export const OPPORTUNITY_OBJECT_ID = 'opportunity-object-id';

export const buildField = ({
  id,
  name,
  type,
  label = name,
  options,
  relationTargetObjectMetadataId,
}: {
  id: string;
  name: string;
  type: FieldMetadataType;
  label?: string;
  options?: { value: string }[];
  relationTargetObjectMetadataId?: string;
}) =>
  ({
    id,
    name,
    label,
    type,
    isActive: true,
    isSystem: false,
    icon: 'IconDefault',
    options,
    relation: isDefined(relationTargetObjectMetadataId)
      ? {
          type: RelationType.MANY_TO_ONE,
          targetObjectMetadata: {
            id: relationTargetObjectMetadataId,
            nameSingular: relationTargetObjectMetadataId,
            namePlural: relationTargetObjectMetadataId,
          },
        }
      : undefined,
  }) as FieldMetadataItem;

export const COMPANY_CREATED_AT = buildField({
  id: 'company-created-at',
  name: 'createdAt',
  label: 'Creation date',
  type: FieldMetadataType.DATE_TIME,
});
export const COMPANY_NAME = buildField({
  id: 'company-name',
  name: 'name',
  label: 'Name',
  type: FieldMetadataType.TEXT,
});
export const COMPANY_ACCOUNT_OWNER = buildField({
  id: 'company-account-owner',
  name: 'accountOwner',
  label: 'Account Owner',
  type: FieldMetadataType.RELATION,
  relationTargetObjectMetadataId: WORKSPACE_MEMBER_OBJECT_ID,
});
export const COMPANY_IDEAL_CUSTOMER = buildField({
  id: 'company-ideal-customer',
  name: 'idealCustomerProfile',
  label: 'ICP',
  type: FieldMetadataType.BOOLEAN,
});

export const PERSON_CREATED_AT = buildField({
  id: 'person-created-at',
  name: 'createdAt',
  label: 'Creation date',
  type: FieldMetadataType.DATE_TIME,
});
export const PERSON_CITY = buildField({
  id: 'person-city',
  name: 'city',
  label: 'City',
  type: FieldMetadataType.TEXT,
});
export const PERSON_COMPANY = buildField({
  id: 'person-company',
  name: 'company',
  label: 'Company',
  type: FieldMetadataType.RELATION,
  relationTargetObjectMetadataId: COMPANY_OBJECT_ID,
});

export const OPPORTUNITY_STAGE = buildField({
  id: 'opportunity-stage',
  name: 'stage',
  label: 'Stage',
  type: FieldMetadataType.SELECT,
  options: [{ value: 'NEW' }, { value: 'WON' }],
});
export const OPPORTUNITY_POINT_OF_CONTACT = buildField({
  id: 'opportunity-point-of-contact',
  name: 'pointOfContact',
  label: 'Point of Contact',
  type: FieldMetadataType.RELATION,
  relationTargetObjectMetadataId: PERSON_OBJECT_ID,
});
export const OPPORTUNITY_OWNER = buildField({
  id: 'opportunity-owner',
  name: 'owner',
  label: 'Owner',
  type: FieldMetadataType.RELATION,
  relationTargetObjectMetadataId: WORKSPACE_MEMBER_OBJECT_ID,
});
export const OPPORTUNITY_ASSIGNEE = buildField({
  id: 'opportunity-assignee',
  name: 'assignee',
  label: 'Assignee',
  type: FieldMetadataType.RELATION,
  relationTargetObjectMetadataId: WORKSPACE_MEMBER_OBJECT_ID,
});

export const WORKSPACE_MEMBER_OBJECT = {
  id: WORKSPACE_MEMBER_OBJECT_ID,
  labelSingular: 'Workspace member',
  fields: [
    buildField({
      id: 'workspace-member-created-at',
      name: 'createdAt',
      type: FieldMetadataType.DATE_TIME,
    }),
  ],
};
export const COMPANY_OBJECT = {
  id: COMPANY_OBJECT_ID,
  labelSingular: 'Company',
  fields: [
    COMPANY_CREATED_AT,
    COMPANY_NAME,
    COMPANY_ACCOUNT_OWNER,
    COMPANY_IDEAL_CUSTOMER,
  ],
};
export const PERSON_OBJECT = {
  id: PERSON_OBJECT_ID,
  labelSingular: 'Person',
  fields: [PERSON_CREATED_AT, PERSON_CITY, PERSON_COMPANY],
};
export const OPPORTUNITY_OBJECT = {
  id: OPPORTUNITY_OBJECT_ID,
  labelSingular: 'Opportunity',
  fields: [
    OPPORTUNITY_STAGE,
    OPPORTUNITY_POINT_OF_CONTACT,
    OPPORTUNITY_OWNER,
    OPPORTUNITY_ASSIGNEE,
  ],
};

export const OBJECT_METADATA_ITEMS = [
  WORKSPACE_MEMBER_OBJECT,
  COMPANY_OBJECT,
  PERSON_OBJECT,
  OPPORTUNITY_OBJECT,
];

export const buildChartWidget = ({
  id,
  objectMetadataId,
  dashboardFilterBindings,
}: {
  id: string;
  objectMetadataId: string | null;
  dashboardFilterBindings?: DashboardFilterBindingsBySlotId;
}) =>
  ({
    id,
    pageLayoutTabId: 'tab-1',
    title: id,
    type: WidgetType.GRAPH,
    objectMetadataId,
    configuration: {
      __typename: 'BarChartConfiguration',
      configurationType: 'BAR_CHART',
      ...(isDefined(dashboardFilterBindings)
        ? { dashboardFilterBindings }
        : {}),
    },
  }) as unknown as PageLayoutWidget;

export const buildDashboardDraft = ({
  widgets,
  dashboardFilters = null,
}: {
  widgets: PageLayoutWidget[];
  dashboardFilters?: DashboardFilterSlot[] | null;
}): DraftPageLayout => ({
  ...makeDraft([makeTab('tab-1', widgets)]),
  type: PageLayoutType.DASHBOARD,
  dashboardFilters,
});

export const getDraftWidget = (draft: DraftPageLayout, widgetId: string) => {
  const widget = draft.tabs
    .flatMap((tab) => tab.widgets)
    .find((candidateWidget) => candidateWidget.id === widgetId);

  if (!isDefined(widget)) {
    throw new Error(`Widget ${widgetId} not found in draft`);
  }

  return widget;
};
