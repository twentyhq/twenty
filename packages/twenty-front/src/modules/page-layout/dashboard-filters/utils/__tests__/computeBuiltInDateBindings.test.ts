import { computeBuiltInDateBindings } from '@/page-layout/dashboard-filters/utils/computeBuiltInDateBindings';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { FieldMetadataType } from 'twenty-shared/types';
import { WidgetType } from '~/generated-metadata/graphql';

const buildWidget = ({
  id,
  type,
  objectMetadataId,
}: {
  id: string;
  type: WidgetType;
  objectMetadataId: string | null;
}) =>
  ({
    id,
    type,
    objectMetadataId,
  }) as PageLayoutWidget;

const COMPANY_OBJECT = {
  id: 'company-object-id',
  fields: [
    {
      id: 'company-created-at-id',
      name: 'createdAt',
      type: FieldMetadataType.DATE_TIME,
      isActive: true,
    },
    {
      id: 'company-name-id',
      name: 'name',
      type: FieldMetadataType.TEXT,
      isActive: true,
    },
  ],
};

const OBJECT_WITH_INACTIVE_CREATED_AT = {
  id: 'legacy-object-id',
  fields: [
    {
      id: 'legacy-created-at-id',
      name: 'createdAt',
      type: FieldMetadataType.DATE_TIME,
      isActive: false,
    },
  ],
};

const OBJECT_METADATA_ITEMS = [
  COMPANY_OBJECT,
  OBJECT_WITH_INACTIVE_CREATED_AT,
] as Parameters<typeof computeBuiltInDateBindings>[0]['objectMetadataItems'];

describe('computeBuiltInDateBindings', () => {
  it('binds each graph widget to the createdAt field of its object', () => {
    const bindings = computeBuiltInDateBindings({
      widgets: [
        buildWidget({
          id: 'chart-1',
          type: WidgetType.GRAPH,
          objectMetadataId: COMPANY_OBJECT.id,
        }),
      ],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(bindings).toEqual({
      'chart-1': { fieldMetadataId: 'company-created-at-id' },
    });
  });

  it('ignores widgets that are not graphs', () => {
    const bindings = computeBuiltInDateBindings({
      widgets: [
        buildWidget({
          id: 'table-1',
          type: WidgetType.RECORD_TABLE,
          objectMetadataId: COMPANY_OBJECT.id,
        }),
      ],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(bindings).toEqual({});
  });

  it('binds null when the widget has no object', () => {
    const bindings = computeBuiltInDateBindings({
      widgets: [
        buildWidget({
          id: 'chart-1',
          type: WidgetType.GRAPH,
          objectMetadataId: null,
        }),
      ],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(bindings).toEqual({ 'chart-1': null });
  });

  it('binds null when the object is unknown', () => {
    const bindings = computeBuiltInDateBindings({
      widgets: [
        buildWidget({
          id: 'chart-1',
          type: WidgetType.GRAPH,
          objectMetadataId: 'unknown-object-id',
        }),
      ],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(bindings).toEqual({ 'chart-1': null });
  });

  it('binds null when the createdAt field is inactive', () => {
    const bindings = computeBuiltInDateBindings({
      widgets: [
        buildWidget({
          id: 'chart-1',
          type: WidgetType.GRAPH,
          objectMetadataId: OBJECT_WITH_INACTIVE_CREATED_AT.id,
        }),
      ],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(bindings).toEqual({ 'chart-1': null });
  });
});
