import { computeRecordFormFields } from '@/object-record/record-form/utils/computeRecordFormFields';
import {
  FieldMetadataType,
  PageLayoutTabLayoutMode,
  RelationType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

const buildFieldMetadataItem = (
  id: string,
  name: string,
  overrides: Partial<{
    type: FieldMetadataType;
    isActive: boolean;
    isSystem: boolean;
    isUIEditable: boolean;
    settings: unknown;
    morphRelations: { sourceFieldMetadata: { id: string; name: string } }[];
  }> = {},
) => ({
  id,
  name,
  type: FieldMetadataType.TEXT,
  isActive: true,
  isSystem: false,
  isUIEditable: true,
  settings: null,
  morphRelations: null,
  ...overrides,
});

const buildFormFieldWidget = ({
  fieldMetadataId,
  index,
  isActive = true,
  type = WidgetType.FORM_FIELD,
  id = `widget-${fieldMetadataId}`,
}: {
  fieldMetadataId: string;
  index: number;
  isActive?: boolean;
  type?: WidgetType;
  id?: string;
}) => ({
  id,
  isActive,
  type,
  position: {
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
    index,
  },
  configuration: {
    configurationType: WidgetConfigurationType.FORM_FIELD,
    fieldMetadataId,
  },
});

const buildPageLayout = (
  tabs: {
    position: number;
    isActive?: boolean;
    widgets: ReturnType<typeof buildFormFieldWidget>[];
  }[],
) => ({
  tabs: tabs.map((tab) => ({
    isActive: tab.isActive ?? true,
    position: tab.position,
    widgets: tab.widgets,
  })),
});

const summarize = (
  recordFormFields: ReturnType<typeof computeRecordFormFields>,
) =>
  recordFormFields.map(({ fieldMetadataItem, widgets, isVisible }) => ({
    name: fieldMetadataItem.name,
    widgets: widgets.map(({ id, isActive }) => [id, isActive]),
    isVisible,
  }));

const NAME_FIELD = buildFieldMetadataItem('field-name', 'name');
const CODE_FIELD = buildFieldMetadataItem('field-code', 'code');
const CITY_FIELD = buildFieldMetadataItem('field-city', 'city');

describe('computeRecordFormFields', () => {
  it('should order fields by their widget index', () => {
    const result = computeRecordFormFields({
      recordFormPageLayout: buildPageLayout([
        {
          position: 10,
          widgets: [
            buildFormFieldWidget({ fieldMetadataId: 'field-code', index: 1 }),
            buildFormFieldWidget({ fieldMetadataId: 'field-name', index: 0 }),
          ],
        },
      ]),
      fieldMetadataItems: [NAME_FIELD, CODE_FIELD],
    });

    expect(result.map(({ fieldMetadataItem }) => fieldMetadataItem)).toEqual([
      NAME_FIELD,
      CODE_FIELD,
    ]);
  });

  it('should keep every tab contiguous rather than interleaving their indexes', () => {
    const result = computeRecordFormFields({
      recordFormPageLayout: buildPageLayout([
        {
          position: 20,
          widgets: [
            buildFormFieldWidget({ fieldMetadataId: 'field-city', index: 0 }),
          ],
        },
        {
          position: 10,
          widgets: [
            buildFormFieldWidget({ fieldMetadataId: 'field-name', index: 0 }),
            buildFormFieldWidget({ fieldMetadataId: 'field-code', index: 1 }),
          ],
        },
      ]),
      fieldMetadataItems: [NAME_FIELD, CODE_FIELD, CITY_FIELD],
    });

    expect(result.map((field) => field.fieldMetadataItem.name)).toEqual([
      'name',
      'code',
      'city',
    ]);
  });

  it('should keep a hidden widget at its position, marked as not visible', () => {
    const result = computeRecordFormFields({
      recordFormPageLayout: buildPageLayout([
        {
          position: 10,
          widgets: [
            buildFormFieldWidget({ fieldMetadataId: 'field-name', index: 0 }),
            buildFormFieldWidget({
              fieldMetadataId: 'field-code',
              index: 1,
              isActive: false,
            }),
            buildFormFieldWidget({ fieldMetadataId: 'field-city', index: 2 }),
          ],
        },
      ]),
      fieldMetadataItems: [NAME_FIELD, CODE_FIELD, CITY_FIELD],
    });

    expect(summarize(result)).toEqual([
      {
        name: 'name',
        widgets: [['widget-field-name', true]],
        isVisible: true,
      },
      {
        name: 'code',
        widgets: [['widget-field-code', false]],
        isVisible: false,
      },
      {
        name: 'city',
        widgets: [['widget-field-city', true]],
        isVisible: true,
      },
    ]);
  });

  it('should merge the widgets of a field into one entry at its first widget, visible only when all of them are', () => {
    const result = computeRecordFormFields({
      recordFormPageLayout: buildPageLayout([
        {
          position: 10,
          widgets: [
            buildFormFieldWidget({
              fieldMetadataId: 'field-name',
              index: 0,
              isActive: false,
              id: 'hidden-name-widget',
            }),
            buildFormFieldWidget({ fieldMetadataId: 'field-code', index: 1 }),
            buildFormFieldWidget({ fieldMetadataId: 'field-name', index: 2 }),
            buildFormFieldWidget({ fieldMetadataId: 'field-city', index: 3 }),
            buildFormFieldWidget({
              fieldMetadataId: 'field-city',
              index: 4,
              id: 'second-city-widget',
            }),
          ],
        },
      ]),
      fieldMetadataItems: [NAME_FIELD, CODE_FIELD, CITY_FIELD],
    });

    expect(summarize(result)).toEqual([
      {
        name: 'name',
        widgets: [
          ['hidden-name-widget', false],
          ['widget-field-name', true],
        ],
        isVisible: false,
      },
      {
        name: 'code',
        widgets: [['widget-field-code', true]],
        isVisible: true,
      },
      {
        name: 'city',
        widgets: [
          ['widget-field-city', true],
          ['second-city-widget', true],
        ],
        isVisible: true,
      },
    ]);
  });

  it('should keep a hidden morph field hidden when a widget is added for a new target', () => {
    const ownerField = buildFieldMetadataItem('field-owner-person', 'owner', {
      type: FieldMetadataType.MORPH_RELATION,
      settings: { relationType: RelationType.MANY_TO_ONE },
      morphRelations: [
        {
          sourceFieldMetadata: {
            id: 'field-owner-person',
            name: 'ownerPerson',
          },
        },
        {
          sourceFieldMetadata: {
            id: 'field-owner-company',
            name: 'ownerCompany',
          },
        },
        {
          sourceFieldMetadata: {
            id: 'field-owner-opportunity',
            name: 'ownerOpportunity',
          },
        },
      ],
    });

    const result = computeRecordFormFields({
      recordFormPageLayout: buildPageLayout([
        {
          position: 10,
          widgets: [
            buildFormFieldWidget({
              fieldMetadataId: 'field-owner-person',
              index: 0,
              isActive: false,
            }),
            buildFormFieldWidget({
              fieldMetadataId: 'field-owner-company',
              index: 1,
              isActive: false,
            }),
            buildFormFieldWidget({ fieldMetadataId: 'field-name', index: 2 }),
            buildFormFieldWidget({
              fieldMetadataId: 'field-owner-opportunity',
              index: 3,
            }),
          ],
        },
      ]),
      fieldMetadataItems: [NAME_FIELD, ownerField],
    });

    expect(summarize(result)).toEqual([
      {
        name: 'owner',
        widgets: [
          ['widget-field-owner-person', false],
          ['widget-field-owner-company', false],
          ['widget-field-owner-opportunity', true],
        ],
        isVisible: false,
      },
      {
        name: 'name',
        widgets: [['widget-field-name', true]],
        isVisible: true,
      },
    ]);
  });

  it('should drop inactive tabs, non form field widgets and widgets of deleted fields', () => {
    const result = computeRecordFormFields({
      recordFormPageLayout: buildPageLayout([
        {
          position: 10,
          widgets: [
            buildFormFieldWidget({ fieldMetadataId: 'field-name', index: 0 }),
            buildFormFieldWidget({ fieldMetadataId: 'field-gone', index: 1 }),
            buildFormFieldWidget({
              fieldMetadataId: 'field-city',
              index: 2,
              type: WidgetType.FIELDS,
            }),
          ],
        },
        {
          position: 20,
          isActive: false,
          widgets: [
            buildFormFieldWidget({ fieldMetadataId: 'field-code', index: 0 }),
          ],
        },
      ]),
      fieldMetadataItems: [NAME_FIELD, CODE_FIELD, CITY_FIELD],
    });

    expect(result.map((field) => field.fieldMetadataItem.name)).toEqual([
      'name',
    ]);
  });

  it('should only keep hidden widgets whose field the form can offer', () => {
    const hiddenFieldMetadataItems = [
      buildFieldMetadataItem('field-inactive', 'inactive', {
        isActive: false,
      }),
      buildFieldMetadataItem('field-system', 'system', { isSystem: true }),
      buildFieldMetadataItem('field-rating', 'rating', {
        type: FieldMetadataType.RATING,
      }),
      buildFieldMetadataItem('field-people', 'people', {
        type: FieldMetadataType.RELATION,
        settings: { relationType: RelationType.ONE_TO_MANY },
      }),
      buildFieldMetadataItem('field-company', 'company', {
        type: FieldMetadataType.RELATION,
        settings: { relationType: RelationType.MANY_TO_ONE },
      }),
      buildFieldMetadataItem('field-legacy', 'legacy', {
        settings: 'not-an-object',
      }),
    ];

    const result = computeRecordFormFields({
      recordFormPageLayout: buildPageLayout([
        {
          position: 10,
          widgets: hiddenFieldMetadataItems.map(({ id }, index) =>
            buildFormFieldWidget({
              fieldMetadataId: id,
              index,
              isActive: false,
            }),
          ),
        },
      ]),
      fieldMetadataItems: hiddenFieldMetadataItems,
    });

    expect(result.map((field) => field.fieldMetadataItem.name)).toEqual([
      'company',
      'legacy',
    ]);
  });

  it('should keep visible widgets whatever their field', () => {
    const visibleFieldMetadataItems = [
      buildFieldMetadataItem('field-system', 'system', { isSystem: true }),
      buildFieldMetadataItem('field-rating', 'rating', {
        type: FieldMetadataType.RATING,
      }),
      buildFieldMetadataItem('field-files', 'files', {
        type: FieldMetadataType.FILES,
      }),
    ];

    const result = computeRecordFormFields({
      recordFormPageLayout: buildPageLayout([
        {
          position: 10,
          widgets: visibleFieldMetadataItems.map(({ id }, index) =>
            buildFormFieldWidget({ fieldMetadataId: id, index }),
          ),
        },
      ]),
      fieldMetadataItems: visibleFieldMetadataItems,
    });

    expect(result.map((field) => field.fieldMetadataItem.name)).toEqual([
      'system',
      'rating',
      'files',
    ]);
  });
});
