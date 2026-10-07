import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { computeDashboardFilterCandidateDimensions } from '@/page-layout/dashboard-filters/utils/computeDashboardFilterCandidateDimensions';
import { getDashboardFilterFieldDimensionKey } from '@/page-layout/dashboard-filters/utils/getDashboardFilterFieldDimensionKey';
import { getDashboardFilterRelationTargetDimensionKey } from '@/page-layout/dashboard-filters/utils/getDashboardFilterRelationTargetDimensionKey';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType, WidgetType } from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');
const taskObjectMetadataItem = getMockObjectMetadataItemOrThrow('task');
const workspaceMemberObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('workspaceMember');
const petObjectMetadataItem = getMockObjectMetadataItemOrThrow('pet');

const OBJECT_METADATA_ITEMS = [
  companyObjectMetadataItem,
  personObjectMetadataItem,
  opportunityObjectMetadataItem,
  taskObjectMetadataItem,
  workspaceMemberObjectMetadataItem,
  petObjectMetadataItem,
];

const getFieldOrThrow = (
  objectMetadataItem: { fields: FieldMetadataItem[] },
  fieldName: string,
) => {
  const field = objectMetadataItem.fields.find(
    (field) => field.name === fieldName,
  );

  if (!isDefined(field)) {
    throw new Error(`Expected a ${fieldName} field`);
  }

  return field;
};

const buildGraphWidget = (id: string, objectMetadataId: string | null) => ({
  id,
  type: WidgetType.GRAPH,
  objectMetadataId,
});

const COMPANY_WIDGET = buildGraphWidget(
  'company-widget',
  companyObjectMetadataItem.id,
);
const PERSON_WIDGET = buildGraphWidget(
  'person-widget',
  personObjectMetadataItem.id,
);
const OPPORTUNITY_WIDGET = buildGraphWidget(
  'opportunity-widget',
  opportunityObjectMetadataItem.id,
);
const TASK_WIDGET = buildGraphWidget('task-widget', taskObjectMetadataItem.id);

const CREATED_AT_DIMENSION_KEY = getDashboardFilterFieldDimensionKey({
  name: 'createdAt',
  type: FieldMetadataType.DATE_TIME,
});

const COMPANY_TARGET_DIMENSION_KEY =
  getDashboardFilterRelationTargetDimensionKey(companyObjectMetadataItem.id);

const WORKSPACE_MEMBER_TARGET_DIMENSION_KEY =
  getDashboardFilterRelationTargetDimensionKey(
    workspaceMemberObjectMetadataItem.id,
  );

const findDimensionByKey = (
  dimensions: ReturnType<typeof computeDashboardFilterCandidateDimensions>,
  key: string,
) => dimensions.find((dimension) => dimension.key === key);

// Pet clones with their own ids let two objects share a select field name while differing on options.
const buildPetLikeObject = ({
  id,
  speciesOptionValues,
}: {
  id: string;
  speciesOptionValues: string[];
}) => {
  const speciesField = getFieldOrThrow(petObjectMetadataItem, 'species');
  const [firstOption] =
    petObjectMetadataItem.fields.find((field) => field.name === 'species')
      ?.options ?? [];

  if (!isDefined(firstOption)) {
    throw new Error('Expected the pet species field to have options');
  }

  return {
    ...petObjectMetadataItem,
    id,
    fields: petObjectMetadataItem.fields.map((field) =>
      field.id === speciesField.id
        ? {
            ...field,
            id: `${id}-species`,
            options: speciesOptionValues.map((value, index) => ({
              ...firstOption,
              id: `${id}-${value}`,
              value,
              label: value,
              position: index,
            })),
          }
        : { ...field, id: `${id}-${field.name}` },
    ),
  };
};

describe('computeDashboardFilterCandidateDimensions', () => {
  it('merges a field shared by every widget object into one dimension by name and type', () => {
    const dimensions = computeDashboardFilterCandidateDimensions({
      widgets: [COMPANY_WIDGET, PERSON_WIDGET, OPPORTUNITY_WIDGET],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    const createdAtDimension = findDimensionByKey(
      dimensions,
      CREATED_AT_DIMENSION_KEY,
    );

    expect(createdAtDimension).toMatchObject({
      filterType: 'DATE_TIME',
      label: getFieldOrThrow(companyObjectMetadataItem, 'createdAt').label,
      proposedBindingsByWidgetId: {
        'company-widget': {
          fieldMetadataId: getFieldOrThrow(
            companyObjectMetadataItem,
            'createdAt',
          ).id,
        },
        'person-widget': {
          fieldMetadataId: getFieldOrThrow(
            personObjectMetadataItem,
            'createdAt',
          ).id,
        },
        'opportunity-widget': {
          fieldMetadataId: getFieldOrThrow(
            opportunityObjectMetadataItem,
            'createdAt',
          ).id,
        },
      },
    });
  });

  it('builds a relation-target dimension binding the relation on related objects and id on the target object', () => {
    const dimensions = computeDashboardFilterCandidateDimensions({
      widgets: [COMPANY_WIDGET, PERSON_WIDGET, OPPORTUNITY_WIDGET],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(
      findDimensionByKey(dimensions, COMPANY_TARGET_DIMENSION_KEY),
    ).toEqual({
      key: COMPANY_TARGET_DIMENSION_KEY,
      label: companyObjectMetadataItem.labelSingular,
      icon: companyObjectMetadataItem.icon,
      filterType: 'RELATION',
      relationTargetObjectMetadataId: companyObjectMetadataItem.id,
      proposedBindingsByWidgetId: {
        'company-widget': {
          fieldMetadataId: getFieldOrThrow(companyObjectMetadataItem, 'id').id,
        },
        'person-widget': {
          fieldMetadataId: getFieldOrThrow(personObjectMetadataItem, 'company')
            .id,
        },
        'opportunity-widget': {
          fieldMetadataId: getFieldOrThrow(
            opportunityObjectMetadataItem,
            'company',
          ).id,
        },
      },
    });
  });

  it('prefers owner-like relation names for the workspace member target', () => {
    const dimensions = computeDashboardFilterCandidateDimensions({
      widgets: [COMPANY_WIDGET, OPPORTUNITY_WIDGET, TASK_WIDGET, PERSON_WIDGET],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(
      findDimensionByKey(dimensions, WORKSPACE_MEMBER_TARGET_DIMENSION_KEY)
        ?.proposedBindingsByWidgetId,
    ).toEqual({
      'company-widget': {
        fieldMetadataId: getFieldOrThrow(
          companyObjectMetadataItem,
          'accountOwner',
        ).id,
      },
      'opportunity-widget': {
        fieldMetadataId: getFieldOrThrow(opportunityObjectMetadataItem, 'owner')
          .id,
      },
      'task-widget': {
        fieldMetadataId: getFieldOrThrow(taskObjectMetadataItem, 'assignee').id,
      },
    });
  });

  it('drops a relation field dimension that only repeats its relation-target dimension', () => {
    const dimensions = computeDashboardFilterCandidateDimensions({
      widgets: [COMPANY_WIDGET, PERSON_WIDGET, OPPORTUNITY_WIDGET],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(
      findDimensionByKey(
        dimensions,
        getDashboardFilterFieldDimensionKey({
          name: 'company',
          type: FieldMetadataType.RELATION,
        }),
      ),
    ).toBeUndefined();
    expect(
      findDimensionByKey(
        dimensions,
        getDashboardFilterFieldDimensionKey({
          name: 'accountOwner',
          type: FieldMetadataType.RELATION,
        }),
      ),
    ).toBeUndefined();
  });

  it('keeps a second relation to the same target as a dimension of its own', () => {
    const companyField = getFieldOrThrow(
      opportunityObjectMetadataItem,
      'company',
    );

    const opportunityWithPartner = {
      ...opportunityObjectMetadataItem,
      fields: [
        ...opportunityObjectMetadataItem.fields,
        {
          ...companyField,
          id: 'partner-company-field-id',
          name: 'partnerCompany',
          label: 'Partner company',
        },
      ],
    };

    const dimensions = computeDashboardFilterCandidateDimensions({
      widgets: [OPPORTUNITY_WIDGET, COMPANY_WIDGET],
      objectMetadataItems: [
        companyObjectMetadataItem,
        opportunityWithPartner,
        workspaceMemberObjectMetadataItem,
        personObjectMetadataItem,
      ],
    });

    expect(
      findDimensionByKey(dimensions, COMPANY_TARGET_DIMENSION_KEY)
        ?.proposedBindingsByWidgetId['opportunity-widget'],
    ).toEqual({ fieldMetadataId: companyField.id });

    expect(
      findDimensionByKey(
        dimensions,
        getDashboardFilterFieldDimensionKey({
          name: 'partnerCompany',
          type: FieldMetadataType.RELATION,
        }),
      ),
    ).toMatchObject({
      label: 'Partner company',
      filterType: 'RELATION',
      proposedBindingsByWidgetId: {
        'opportunity-widget': { fieldMetadataId: 'partner-company-field-id' },
      },
    });
  });

  it('never offers the raw id field as a dimension of its own', () => {
    const dimensions = computeDashboardFilterCandidateDimensions({
      widgets: [COMPANY_WIDGET],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(
      findDimensionByKey(
        dimensions,
        getDashboardFilterFieldDimensionKey({
          name: 'id',
          type: FieldMetadataType.UUID,
        }),
      ),
    ).toBeUndefined();
  });

  it('merges select fields only when their option values are identical', () => {
    const dogsAndCats = buildPetLikeObject({
      id: 'dogs-and-cats-object',
      speciesOptionValues: ['DOG', 'CAT'],
    });
    const catsAndDogs = buildPetLikeObject({
      id: 'cats-and-dogs-object',
      speciesOptionValues: ['CAT', 'DOG'],
    });
    const allAnimals = buildPetLikeObject({
      id: 'all-animals-object',
      speciesOptionValues: ['DOG', 'CAT', 'BIRD'],
    });

    const dimensions = computeDashboardFilterCandidateDimensions({
      widgets: [
        buildGraphWidget('dogs-and-cats-widget', dogsAndCats.id),
        buildGraphWidget('cats-and-dogs-widget', catsAndDogs.id),
        buildGraphWidget('all-animals-widget', allAnimals.id),
      ],
      objectMetadataItems: [dogsAndCats, catsAndDogs, allAnimals],
    });

    const speciesDimensions = dimensions.filter((dimension) =>
      dimension.key.startsWith('field:species:SELECT'),
    );

    expect(speciesDimensions).toHaveLength(2);
    expect(
      speciesDimensions.map((dimension) =>
        Object.keys(dimension.proposedBindingsByWidgetId).sort(),
      ),
    ).toEqual([
      ['cats-and-dogs-widget', 'dogs-and-cats-widget'],
      ['all-animals-widget'],
    ]);
  });

  it('sorts dimensions covering more widgets first, then by label', () => {
    const dimensions = computeDashboardFilterCandidateDimensions({
      widgets: [COMPANY_WIDGET, PERSON_WIDGET, TASK_WIDGET],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    const boundWidgetCounts = dimensions.map(
      (dimension) => Object.keys(dimension.proposedBindingsByWidgetId).length,
    );

    expect(boundWidgetCounts).toEqual(
      [...boundWidgetCounts].sort((countA, countB) => countB - countA),
    );

    const threeWidgetLabels = dimensions
      .filter(
        (dimension) =>
          Object.keys(dimension.proposedBindingsByWidgetId).length === 3,
      )
      .map((dimension) => dimension.label);

    expect(threeWidgetLabels).toEqual(
      [...threeWidgetLabels].sort((labelA, labelB) =>
        labelA.localeCompare(labelB),
      ),
    );
  });

  it('excludes a field dimension already bound by an existing slot', () => {
    const existingBindingsByWidgetId: Record<
      string,
      Record<string, DashboardFilterBinding | null>
    > = {
      'company-widget': {
        'date-slot': {
          fieldMetadataId: getFieldOrThrow(
            companyObjectMetadataItem,
            'createdAt',
          ).id,
        },
      },
    };

    const dimensions = computeDashboardFilterCandidateDimensions({
      widgets: [COMPANY_WIDGET, PERSON_WIDGET],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
      existingBindingsByWidgetId,
    });

    expect(
      findDimensionByKey(dimensions, CREATED_AT_DIMENSION_KEY),
    ).toBeUndefined();
  });

  it('excludes a relation-target dimension only when an existing slot covers all of its bindings', () => {
    const ownerSlotBindings: Record<
      string,
      Record<string, DashboardFilterBinding | null>
    > = {
      'company-widget': {
        'owner-slot': {
          fieldMetadataId: getFieldOrThrow(
            companyObjectMetadataItem,
            'accountOwner',
          ).id,
        },
      },
      'task-widget': {
        'owner-slot': {
          fieldMetadataId: getFieldOrThrow(taskObjectMetadataItem, 'assignee')
            .id,
        },
      },
    };

    expect(
      findDimensionByKey(
        computeDashboardFilterCandidateDimensions({
          widgets: [COMPANY_WIDGET, TASK_WIDGET],
          objectMetadataItems: OBJECT_METADATA_ITEMS,
          existingBindingsByWidgetId: ownerSlotBindings,
        }),
        WORKSPACE_MEMBER_TARGET_DIMENSION_KEY,
      ),
    ).toBeUndefined();

    const assigneeOnlySlotBindings: Record<
      string,
      Record<string, DashboardFilterBinding | null>
    > = {
      'task-widget': {
        'assignee-slot': {
          fieldMetadataId: getFieldOrThrow(taskObjectMetadataItem, 'assignee')
            .id,
        },
      },
    };

    expect(
      findDimensionByKey(
        computeDashboardFilterCandidateDimensions({
          widgets: [COMPANY_WIDGET, TASK_WIDGET],
          objectMetadataItems: OBJECT_METADATA_ITEMS,
          existingBindingsByWidgetId: assigneeOnlySlotBindings,
        }),
        WORKSPACE_MEMBER_TARGET_DIMENSION_KEY,
      ),
    ).toBeDefined();
  });

  it('ignores non-graph widgets, widgets without an object and unknown objects', () => {
    const dimensions = computeDashboardFilterCandidateDimensions({
      widgets: [
        {
          id: 'record-table-widget',
          type: WidgetType.RECORD_TABLE,
          objectMetadataId: companyObjectMetadataItem.id,
        },
        buildGraphWidget('graph-widget-without-object', null),
        buildGraphWidget('orphan-widget', 'deleted-object-id'),
      ],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(dimensions).toEqual([]);
  });
});
