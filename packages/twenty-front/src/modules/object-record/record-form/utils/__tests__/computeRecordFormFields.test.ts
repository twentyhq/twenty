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
    settings: { relationType: RelationType } | null;
  }> = {},
) => ({
  id,
  name,
  type: FieldMetadataType.TEXT,
  isActive: true,
  isSystem: false,
  isUIEditable: true,
  settings: null,
  ...overrides,
});

const buildFormFieldWidget = ({
  fieldMetadataId,
  index,
  isActive = true,
  type = WidgetType.FORM_FIELD,
}: {
  fieldMetadataId: string;
  index: number;
  isActive?: boolean;
  type?: WidgetType;
}) => ({
  id: `widget-${fieldMetadataId}`,
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
      restrictedFields: {},
    });

    expect(result).toEqual([
      {
        widgetId: 'widget-field-name',
        fieldMetadataItem: NAME_FIELD,
        isVisible: true,
      },
      {
        widgetId: 'widget-field-code',
        fieldMetadataItem: CODE_FIELD,
        isVisible: true,
      },
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
      restrictedFields: {},
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
      restrictedFields: {},
    });

    expect(
      result.map(({ fieldMetadataItem, isVisible }) => [
        fieldMetadataItem.name,
        isVisible,
      ]),
    ).toEqual([
      ['name', true],
      ['code', false],
      ['city', true],
    ]);
  });

  it('should keep a single entry per field, preferring a visible widget', () => {
    const result = computeRecordFormFields({
      recordFormPageLayout: buildPageLayout([
        {
          position: 10,
          widgets: [
            {
              ...buildFormFieldWidget({
                fieldMetadataId: 'field-name',
                index: 0,
                isActive: false,
              }),
              id: 'hidden-name-widget',
            },
            buildFormFieldWidget({ fieldMetadataId: 'field-name', index: 1 }),
            buildFormFieldWidget({ fieldMetadataId: 'field-code', index: 2 }),
            {
              ...buildFormFieldWidget({
                fieldMetadataId: 'field-code',
                index: 3,
              }),
              id: 'second-code-widget',
            },
          ],
        },
      ]),
      fieldMetadataItems: [NAME_FIELD, CODE_FIELD],
      restrictedFields: {},
    });

    expect(
      result.map(({ widgetId, isVisible }) => [widgetId, isVisible]),
    ).toEqual([
      ['widget-field-name', true],
      ['widget-field-code', true],
    ]);
  });

  it('should drop inactive tabs and non form field widgets', () => {
    const result = computeRecordFormFields({
      recordFormPageLayout: buildPageLayout([
        {
          position: 10,
          widgets: [
            buildFormFieldWidget({ fieldMetadataId: 'field-name', index: 0 }),
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
            buildFormFieldWidget({
              fieldMetadataId: 'field-code',
              index: 0,
              isActive: false,
            }),
          ],
        },
      ]),
      fieldMetadataItems: [NAME_FIELD, CODE_FIELD, CITY_FIELD],
      restrictedFields: {},
    });

    expect(result.map((field) => field.fieldMetadataItem.name)).toEqual([
      'name',
    ]);
  });

  it('should drop widgets whose field is deleted, deactivated or no longer supported', () => {
    const result = computeRecordFormFields({
      recordFormPageLayout: buildPageLayout([
        {
          position: 10,
          widgets: [
            buildFormFieldWidget({ fieldMetadataId: 'field-name', index: 0 }),
            buildFormFieldWidget({ fieldMetadataId: 'field-gone', index: 1 }),
            buildFormFieldWidget({
              fieldMetadataId: 'field-inactive',
              index: 2,
              isActive: false,
            }),
            buildFormFieldWidget({
              fieldMetadataId: 'field-rating',
              index: 3,
              isActive: false,
            }),
            buildFormFieldWidget({
              fieldMetadataId: 'field-people',
              index: 4,
              isActive: false,
            }),
          ],
        },
      ]),
      fieldMetadataItems: [
        NAME_FIELD,
        buildFieldMetadataItem('field-inactive', 'inactive', {
          isActive: false,
        }),
        buildFieldMetadataItem('field-rating', 'rating', {
          type: FieldMetadataType.RATING,
        }),
        buildFieldMetadataItem('field-people', 'people', {
          type: FieldMetadataType.RELATION,
          settings: { relationType: RelationType.ONE_TO_MANY },
        }),
      ],
      restrictedFields: {},
    });

    expect(result.map((field) => field.fieldMetadataItem.name)).toEqual([
      'name',
    ]);
  });

  it('should drop fields the user cannot update, whether visible or hidden', () => {
    const result = computeRecordFormFields({
      recordFormPageLayout: buildPageLayout([
        {
          position: 10,
          widgets: [
            buildFormFieldWidget({ fieldMetadataId: 'field-name', index: 0 }),
            buildFormFieldWidget({ fieldMetadataId: 'field-code', index: 1 }),
            buildFormFieldWidget({
              fieldMetadataId: 'field-city',
              index: 2,
              isActive: false,
            }),
          ],
        },
      ]),
      fieldMetadataItems: [NAME_FIELD, CODE_FIELD, CITY_FIELD],
      restrictedFields: {
        'field-code': { canRead: true, canUpdate: false },
        'field-city': { canRead: true, canUpdate: false },
      },
    });

    expect(result.map((field) => field.fieldMetadataItem.name)).toEqual([
      'name',
    ]);
  });
});
