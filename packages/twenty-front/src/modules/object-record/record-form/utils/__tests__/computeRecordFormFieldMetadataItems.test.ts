import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { computeRecordFormFieldMetadataItems } from '@/object-record/record-form/utils/computeRecordFormFieldMetadataItems';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import {
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

const buildFieldMetadataItem = (id: string, name: string) =>
  ({ id, name }) as FieldMetadataItem;

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
}) =>
  ({
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
  }) as never;

const buildPageLayout = (
  tabs: { position: number; isActive?: boolean; widgets: unknown[] }[],
) =>
  ({
    tabs: tabs.map((tab, tabIndex) => ({
      id: `tab-${tabIndex}`,
      isActive: tab.isActive ?? true,
      position: tab.position,
      widgets: tab.widgets,
    })),
  }) as unknown as PageLayout;

const NAME_FIELD = buildFieldMetadataItem('field-name', 'name');
const CODE_FIELD = buildFieldMetadataItem('field-code', 'code');
const CITY_FIELD = buildFieldMetadataItem('field-city', 'city');

describe('computeRecordFormFieldMetadataItems', () => {
  it('should order fields by their widget index', () => {
    const result = computeRecordFormFieldMetadataItems({
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

    expect(result.map((field) => field.name)).toEqual(['name', 'code']);
  });

  it('should keep every tab contiguous rather than interleaving their indexes', () => {
    const result = computeRecordFormFieldMetadataItems({
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

    expect(result.map((field) => field.name)).toEqual(['name', 'code', 'city']);
  });

  it('should drop inactive widgets, inactive tabs and non form field widgets', () => {
    const result = computeRecordFormFieldMetadataItems({
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
            buildFormFieldWidget({ fieldMetadataId: 'field-city', index: 0 }),
          ],
        },
      ]),
      fieldMetadataItems: [NAME_FIELD, CODE_FIELD, CITY_FIELD],
    });

    expect(result.map((field) => field.name)).toEqual(['name']);
  });

  it('should drop widgets whose field is not on the object', () => {
    const result = computeRecordFormFieldMetadataItems({
      recordFormPageLayout: buildPageLayout([
        {
          position: 10,
          widgets: [
            buildFormFieldWidget({ fieldMetadataId: 'field-name', index: 0 }),
            buildFormFieldWidget({ fieldMetadataId: 'field-gone', index: 1 }),
          ],
        },
      ]),
      fieldMetadataItems: [NAME_FIELD],
    });

    expect(result.map((field) => field.name)).toEqual(['name']);
  });
});
