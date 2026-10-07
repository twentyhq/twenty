import { computeBindingsForNewWidget } from '@/page-layout/dashboard-filters/utils/computeBindingsForNewWidget';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';
import {
  TEST_BAR_CHART_CONFIGURATION,
  TEST_IFRAME_CONFIGURATION,
  createTestWidget,
} from '~/testing/mock-data/widget-configurations';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');
const taskObjectMetadataItem = getMockObjectMetadataItemOrThrow('task');
const noteObjectMetadataItem = getMockObjectMetadataItemOrThrow('note');
const workspaceMemberObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('workspaceMember');

const OBJECT_METADATA_ITEMS = [
  companyObjectMetadataItem,
  personObjectMetadataItem,
  opportunityObjectMetadataItem,
  taskObjectMetadataItem,
  noteObjectMetadataItem,
  workspaceMemberObjectMetadataItem,
];

const getFieldIdOrThrow = (
  objectMetadataItem: { fields: { id: string; name: string }[] },
  fieldName: string,
) => {
  const field = objectMetadataItem.fields.find(
    (field) => field.name === fieldName,
  );

  if (!isDefined(field)) {
    throw new Error(`Expected a ${fieldName} field`);
  }

  return field.id;
};

const SLOTS: DashboardFilterSlot[] = [
  {
    id: 'date-slot',
    label: 'Date',
    filterType: 'DATE_TIME',
    defaultOperand: ViewFilterOperand.IS_RELATIVE,
  },
  {
    id: 'owner-slot',
    label: 'Owner',
    filterType: 'RELATION',
    defaultOperand: ViewFilterOperand.IS,
  },
  {
    id: 'company-slot',
    label: 'Company',
    filterType: 'RELATION',
    defaultOperand: ViewFilterOperand.IS,
  },
  {
    id: 'stage-slot',
    label: 'Stage',
    filterType: 'SELECT',
    defaultOperand: ViewFilterOperand.IS,
  },
  {
    id: 'unbound-slot',
    label: 'Nobody binds me',
    filterType: 'RELATION',
    defaultOperand: ViewFilterOperand.IS,
  },
];

const buildBoundGraphWidget = (
  id: string,
  dashboardFilterBindings: Record<string, DashboardFilterBinding | null>,
) =>
  createTestWidget({
    id,
    type: WidgetType.GRAPH,
    configuration: {
      ...TEST_BAR_CHART_CONFIGURATION,
      dashboardFilterBindings,
    },
  });

const COMPANY_WIDGET = buildBoundGraphWidget('company-widget', {
  'date-slot': {
    fieldMetadataId: getFieldIdOrThrow(companyObjectMetadataItem, 'createdAt'),
  },
  'owner-slot': {
    fieldMetadataId: getFieldIdOrThrow(
      companyObjectMetadataItem,
      'accountOwner',
    ),
  },
  'company-slot': {
    fieldMetadataId: getFieldIdOrThrow(companyObjectMetadataItem, 'id'),
  },
  'stage-slot': null,
});

const OPPORTUNITY_WIDGET = buildBoundGraphWidget('opportunity-widget', {
  'stage-slot': {
    fieldMetadataId: getFieldIdOrThrow(opportunityObjectMetadataItem, 'stage'),
  },
});

const EXISTING_WIDGETS = [
  COMPANY_WIDGET,
  OPPORTUNITY_WIDGET,
  createTestWidget({
    id: 'iframe-widget',
    type: WidgetType.IFRAME,
    configuration: TEST_IFRAME_CONFIGURATION,
  }),
];

describe('computeBindingsForNewWidget', () => {
  it('matches fields by name and type, falls back to the relation to the slot target and leaves the rest null', () => {
    expect(
      computeBindingsForNewWidget({
        widget: { objectMetadataId: personObjectMetadataItem.id },
        slots: SLOTS,
        existingWidgets: EXISTING_WIDGETS,
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toEqual({
      'date-slot': {
        fieldMetadataId: getFieldIdOrThrow(
          personObjectMetadataItem,
          'createdAt',
        ),
      },
      'owner-slot': null,
      'company-slot': {
        fieldMetadataId: getFieldIdOrThrow(personObjectMetadataItem, 'company'),
      },
      'stage-slot': null,
      'unbound-slot': null,
    });
  });

  it('binds a workspace member slot to the owner-like relation of the new object', () => {
    expect(
      computeBindingsForNewWidget({
        widget: { objectMetadataId: taskObjectMetadataItem.id },
        slots: SLOTS,
        existingWidgets: EXISTING_WIDGETS,
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toMatchObject({
      'owner-slot': {
        fieldMetadataId: getFieldIdOrThrow(taskObjectMetadataItem, 'assignee'),
      },
      'company-slot': null,
    });
  });

  it('binds id when the new widget object is the slot target itself', () => {
    expect(
      computeBindingsForNewWidget({
        widget: { objectMetadataId: companyObjectMetadataItem.id },
        slots: SLOTS,
        existingWidgets: EXISTING_WIDGETS,
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toMatchObject({
      'company-slot': {
        fieldMetadataId: getFieldIdOrThrow(companyObjectMetadataItem, 'id'),
      },
      'stage-slot': null,
    });
  });

  it('leaves every slot null for an object without matching fields or relations', () => {
    expect(
      computeBindingsForNewWidget({
        widget: { objectMetadataId: noteObjectMetadataItem.id },
        slots: SLOTS,
        existingWidgets: EXISTING_WIDGETS,
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toEqual({
      'date-slot': {
        fieldMetadataId: getFieldIdOrThrow(noteObjectMetadataItem, 'createdAt'),
      },
      'owner-slot': null,
      'company-slot': null,
      'stage-slot': null,
      'unbound-slot': null,
    });
  });

  it('carries a target field binding over when the matching relation reaches the same object', () => {
    const contactNameSlot: DashboardFilterSlot = {
      id: 'contact-name-slot',
      label: 'Contact name',
      filterType: 'FULL_NAME',
    };

    const widgetBoundThroughPointOfContact = buildBoundGraphWidget(
      'bound-opportunity-widget',
      {
        'contact-name-slot': {
          fieldMetadataId: getFieldIdOrThrow(
            opportunityObjectMetadataItem,
            'pointOfContact',
          ),
          relationTargetFieldMetadataId: getFieldIdOrThrow(
            personObjectMetadataItem,
            'name',
          ),
        },
      },
    );

    expect(
      computeBindingsForNewWidget({
        widget: { objectMetadataId: opportunityObjectMetadataItem.id },
        slots: [contactNameSlot],
        existingWidgets: [widgetBoundThroughPointOfContact],
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toEqual({
      'contact-name-slot': {
        fieldMetadataId: getFieldIdOrThrow(
          opportunityObjectMetadataItem,
          'pointOfContact',
        ),
        relationTargetFieldMetadataId: getFieldIdOrThrow(
          personObjectMetadataItem,
          'name',
        ),
      },
    });
  });

  it('does not match a same-named select field whose options differ', () => {
    const petObjectMetadataItem = getMockObjectMetadataItemOrThrow('pet');
    const speciesField = petObjectMetadataItem.fields.find(
      (field) => field.name === 'species',
    );

    if (!isDefined(speciesField) || !isDefined(speciesField.options?.[0])) {
      throw new Error('Expected the pet species field to have options');
    }

    const [firstOption] = speciesField.options;

    const buildPetLikeObject = (id: string, optionValues: string[]) => ({
      ...petObjectMetadataItem,
      id,
      fields: petObjectMetadataItem.fields.map((field) =>
        field.id === speciesField.id
          ? {
              ...field,
              id: `${id}-species`,
              options: optionValues.map((value, index) => ({
                ...firstOption,
                id: `${id}-${value}`,
                value,
                label: value,
                position: index,
              })),
            }
          : { ...field, id: `${id}-${field.name}` },
      ),
    });

    const dogsAndCats = buildPetLikeObject('dogs-and-cats-object', [
      'DOG',
      'CAT',
    ]);
    const allAnimals = buildPetLikeObject('all-animals-object', [
      'DOG',
      'CAT',
      'BIRD',
    ]);

    const speciesSlot: DashboardFilterSlot = {
      id: 'species-slot',
      label: 'Species',
      filterType: 'SELECT',
    };

    expect(
      computeBindingsForNewWidget({
        widget: { objectMetadataId: allAnimals.id },
        slots: [speciesSlot],
        existingWidgets: [
          buildBoundGraphWidget('dogs-and-cats-widget', {
            'species-slot': { fieldMetadataId: 'dogs-and-cats-object-species' },
          }),
        ],
        objectMetadataItems: [dogsAndCats, allAnimals],
      }),
    ).toEqual({ 'species-slot': null });
  });

  it('returns nothing for a widget whose object is unknown', () => {
    expect(
      computeBindingsForNewWidget({
        widget: { objectMetadataId: null },
        slots: SLOTS,
        existingWidgets: EXISTING_WIDGETS,
        objectMetadataItems: OBJECT_METADATA_ITEMS,
      }),
    ).toEqual({});
  });
});
