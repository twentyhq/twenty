import {
  COMPANY_ACCOUNT_OWNER,
  COMPANY_CREATED_AT,
  COMPANY_IDEAL_CUSTOMER,
  COMPANY_NAME,
  COMPANY_OBJECT_ID,
  OBJECT_METADATA_ITEMS,
  OPPORTUNITY_ASSIGNEE,
  OPPORTUNITY_OBJECT_ID,
  OPPORTUNITY_POINT_OF_CONTACT,
  OPPORTUNITY_STAGE,
  PERSON_COMPANY,
  PERSON_CREATED_AT,
  PERSON_OBJECT_ID,
  WORKSPACE_MEMBER_OBJECT_ID,
  buildChartWidget,
  buildField,
} from '@/page-layout/dashboard-filters/testing/dashboardFilterTestFixtures';
import { computeDashboardFilterCandidateDimensions } from '@/page-layout/dashboard-filters/utils/computeDashboardFilterCandidateDimensions';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { FieldMetadataType } from 'twenty-shared/types';
import { WidgetType } from '~/generated-metadata/graphql';

const COMPANY_CHART = buildChartWidget({
  id: 'companies',
  objectMetadataId: COMPANY_OBJECT_ID,
});
const PERSON_CHART = buildChartWidget({
  id: 'people',
  objectMetadataId: PERSON_OBJECT_ID,
});
const OPPORTUNITY_CHART = buildChartWidget({
  id: 'opportunities',
  objectMetadataId: OPPORTUNITY_OBJECT_ID,
});

const compute = (widgets: PageLayoutWidget[]) =>
  computeDashboardFilterCandidateDimensions({
    widgets,
    objectMetadataItems: OBJECT_METADATA_ITEMS,
  });

const findDimension = (
  dimensions: ReturnType<typeof compute>,
  label: string,
) => {
  const dimension = dimensions.find(
    (candidateDimension) => candidateDimension.label === label,
  );

  if (dimension === undefined) {
    throw new Error(`Dimension ${label} not found`);
  }

  return dimension;
};

describe('computeDashboardFilterCandidateDimensions', () => {
  it('merges fields sharing a name and a type across the charts objects', () => {
    const dimensions = compute([COMPANY_CHART, PERSON_CHART]);

    expect(findDimension(dimensions, 'Creation date')).toEqual({
      id: `field:createdAt:${FieldMetadataType.DATE_TIME}`,
      label: 'Creation date',
      filterType: 'DATE_TIME',
      proposedBindingsByWidgetId: {
        companies: { fieldMetadataId: COMPANY_CREATED_AT.id },
        people: { fieldMetadataId: PERSON_CREATED_AT.id },
      },
      boundChartCount: 2,
      chartCount: 2,
    });
  });

  it('proposes null for charts whose object lacks the field', () => {
    const dimensions = compute([COMPANY_CHART, PERSON_CHART]);

    expect(findDimension(dimensions, 'Name')).toMatchObject({
      proposedBindingsByWidgetId: {
        companies: { fieldMetadataId: COMPANY_NAME.id },
        people: null,
      },
      boundChartCount: 1,
      chartCount: 2,
    });
    expect(findDimension(dimensions, 'ICP')).toMatchObject({
      filterType: 'BOOLEAN',
      proposedBindingsByWidgetId: {
        companies: { fieldMetadataId: COMPANY_IDEAL_CUSTOMER.id },
        people: null,
      },
    });
  });

  it('offers one dimension per relation target object, covering every relation to it', () => {
    const dimensions = compute([COMPANY_CHART, OPPORTUNITY_CHART]);

    expect(findDimension(dimensions, 'Workspace member')).toEqual({
      id: 'relation-target:workspace-member-object-id',
      label: 'Workspace member',
      filterType: 'RELATION',
      proposedBindingsByWidgetId: {
        companies: { fieldMetadataId: COMPANY_ACCOUNT_OWNER.id },
        // Several relations point at the same object: the first by name is bound.
        opportunities: { fieldMetadataId: OPPORTUNITY_ASSIGNEE.id },
      },
      boundChartCount: 2,
      chartCount: 2,
    });
    expect(findDimension(dimensions, 'Person')).toMatchObject({
      proposedBindingsByWidgetId: {
        companies: null,
        opportunities: { fieldMetadataId: OPPORTUNITY_POINT_OF_CONTACT.id },
      },
    });
    expect(
      dimensions.filter((dimension) => dimension.label === 'Account Owner'),
    ).toEqual([]);
  });

  it('keeps select fields apart when their option values differ', () => {
    const otherStageField = buildField({
      id: 'other-stage',
      name: 'stage',
      label: 'Stage',
      type: FieldMetadataType.SELECT,
      options: [{ value: 'NEW' }, { value: 'LOST' }],
    });
    const sameStageField = buildField({
      id: 'same-stage',
      name: 'stage',
      label: 'Stage',
      type: FieldMetadataType.SELECT,
      options: [{ value: 'WON' }, { value: 'NEW' }],
    });

    const dimensions = computeDashboardFilterCandidateDimensions({
      widgets: [
        OPPORTUNITY_CHART,
        buildChartWidget({ id: 'other', objectMetadataId: 'other-object' }),
        buildChartWidget({ id: 'same', objectMetadataId: 'same-object' }),
      ],
      objectMetadataItems: [
        ...OBJECT_METADATA_ITEMS,
        {
          id: 'other-object',
          labelSingular: 'Other',
          fields: [otherStageField],
        },
        { id: 'same-object', labelSingular: 'Same', fields: [sameStageField] },
      ],
    });

    const stageDimensions = dimensions.filter(
      (dimension) => dimension.label === 'Stage',
    );

    expect(stageDimensions).toHaveLength(2);
    expect(stageDimensions[0].proposedBindingsByWidgetId).toEqual({
      opportunities: { fieldMetadataId: OPPORTUNITY_STAGE.id },
      other: null,
      same: { fieldMetadataId: sameStageField.id },
    });
    expect(stageDimensions[1].proposedBindingsByWidgetId).toEqual({
      opportunities: null,
      other: { fieldMetadataId: otherStageField.id },
      same: null,
    });
  });

  it('ignores non-chart widgets and fields of unsupported filter types', () => {
    const numberField = buildField({
      id: 'employees',
      name: 'employees',
      type: FieldMetadataType.NUMBER,
    });

    const dimensions = computeDashboardFilterCandidateDimensions({
      widgets: [
        COMPANY_CHART,
        {
          ...buildChartWidget({ id: 'iframe', objectMetadataId: null }),
          type: WidgetType.IFRAME,
        } as PageLayoutWidget,
      ],
      objectMetadataItems: [
        {
          ...OBJECT_METADATA_ITEMS[1],
          fields: [...OBJECT_METADATA_ITEMS[1].fields, numberField],
        },
        OBJECT_METADATA_ITEMS[0],
      ],
    });

    expect(dimensions.map((dimension) => dimension.label)).toEqual([
      'Creation date',
      'ICP',
      'Name',
      'Workspace member',
    ]);
    expect(dimensions[0].chartCount).toBe(1);
  });

  it('orders dimensions by chart coverage, then label', () => {
    const dimensions = compute([COMPANY_CHART, PERSON_CHART]);

    expect(dimensions.map((dimension) => dimension.label)).toEqual([
      'Creation date',
      'City',
      'Company',
      'ICP',
      'Name',
      'Workspace member',
    ]);
  });

  it('puts the built-in slots first when the dashboard still uses them', () => {
    const dimensions = computeDashboardFilterCandidateDimensions({
      widgets: [COMPANY_CHART, PERSON_CHART],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
      builtInSlotsAndBindings: {
        slots: [
          { id: 'built-in-date', label: 'Date', filterType: 'DATE_TIME' },
          { id: 'built-in-owner', label: 'Owner', filterType: 'RELATION' },
        ],
        bindingsByWidgetId: {
          companies: {
            'built-in-date': { fieldMetadataId: COMPANY_CREATED_AT.id },
            'built-in-owner': { fieldMetadataId: COMPANY_ACCOUNT_OWNER.id },
          },
          people: {
            'built-in-date': { fieldMetadataId: PERSON_CREATED_AT.id },
            'built-in-owner': null,
          },
        },
      },
    });

    expect(dimensions.slice(0, 2)).toEqual([
      {
        id: 'built-in-date',
        label: 'Date',
        filterType: 'DATE_TIME',
        proposedBindingsByWidgetId: {
          companies: { fieldMetadataId: COMPANY_CREATED_AT.id },
          people: { fieldMetadataId: PERSON_CREATED_AT.id },
        },
        boundChartCount: 2,
        chartCount: 2,
        isBuiltIn: true,
      },
      {
        id: 'built-in-owner',
        label: 'Owner',
        filterType: 'RELATION',
        proposedBindingsByWidgetId: {
          companies: { fieldMetadataId: COMPANY_ACCOUNT_OWNER.id },
          people: null,
        },
        boundChartCount: 1,
        chartCount: 2,
        isBuiltIn: true,
      },
    ]);
    expect(dimensions[2].isBuiltIn).toBeUndefined();
  });

  it('drops computed twins of the built-ins but keeps genuinely different dimensions', () => {
    const taskCreatedAt = buildField({
      id: 'task-created-at',
      name: 'createdAt',
      label: 'Creation date',
      type: FieldMetadataType.DATE_TIME,
    });
    const taskAssignee = buildField({
      id: 'task-assignee',
      name: 'assignee',
      label: 'Assignee',
      type: FieldMetadataType.RELATION,
      relationTargetObjectMetadataId: WORKSPACE_MEMBER_OBJECT_ID,
    });
    const taskDueAt = buildField({
      id: 'task-due-at',
      name: 'dueAt',
      label: 'Due date',
      type: FieldMetadataType.DATE_TIME,
    });
    const taskChart = buildChartWidget({
      id: 'tasks',
      objectMetadataId: 'task-object-id',
    });

    const dimensions = computeDashboardFilterCandidateDimensions({
      widgets: [COMPANY_CHART, taskChart],
      objectMetadataItems: [
        ...OBJECT_METADATA_ITEMS,
        {
          id: 'task-object-id',
          labelSingular: 'Task',
          fields: [taskCreatedAt, taskAssignee, taskDueAt],
        },
      ],
      builtInSlotsAndBindings: {
        slots: [
          { id: 'built-in-date', label: 'Date', filterType: 'DATE_TIME' },
          { id: 'built-in-owner', label: 'Owner', filterType: 'RELATION' },
        ],
        bindingsByWidgetId: {
          companies: {
            'built-in-date': { fieldMetadataId: COMPANY_CREATED_AT.id },
            'built-in-owner': { fieldMetadataId: COMPANY_ACCOUNT_OWNER.id },
          },
          tasks: {
            'built-in-date': { fieldMetadataId: taskCreatedAt.id },
            'built-in-owner': { fieldMetadataId: taskAssignee.id },
          },
        },
      },
    });

    expect(dimensions.map((dimension) => dimension.label)).toEqual([
      'Date',
      'Owner',
      'Due date',
      'ICP',
      'Name',
    ]);
  });

  it('returns no dimension without charts', () => {
    expect(compute([])).toEqual([]);
  });

  it('counts a chart whose object is unknown without binding it', () => {
    const dimensions = compute([
      COMPANY_CHART,
      buildChartWidget({ id: 'orphan', objectMetadataId: 'deleted-object' }),
    ]);

    expect(findDimension(dimensions, 'Name')).toMatchObject({
      proposedBindingsByWidgetId: {
        companies: { fieldMetadataId: COMPANY_NAME.id },
        orphan: null,
      },
      chartCount: 2,
    });
  });

  it('does not list a relation field as a field dimension even when charts share its name', () => {
    const dimensions = compute([PERSON_CHART, PERSON_CHART]);

    expect(dimensions.map((dimension) => dimension.id)).not.toContain(
      `field:${PERSON_COMPANY.name}:${FieldMetadataType.RELATION}`,
    );
  });
});
