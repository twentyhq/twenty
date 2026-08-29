import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldSupportedAsChartGroupBySubField } from '@/side-panel/pages/page-layout/utils/isFieldSupportedAsChartGroupBySubField';
import { FieldMetadataType } from 'twenty-shared/types';

const createFieldMetadataItem = (
  overrides: Partial<FieldMetadataItem>,
): FieldMetadataItem =>
  ({
    id: 'field-id',
    name: 'testField',
    label: 'Test Field',
    type: FieldMetadataType.TEXT,
    isSystem: false,
    ...overrides,
  }) as FieldMetadataItem;

describe('isFieldSupportedAsChartGroupBySubField', () => {
  it('should accept a non-system scalar field', () => {
    expect(
      isFieldSupportedAsChartGroupBySubField(
        createFieldMetadataItem({ name: 'name', type: FieldMetadataType.TEXT }),
      ),
    ).toBe(true);
  });

  it('should reject a system field like userId', () => {
    expect(
      isFieldSupportedAsChartGroupBySubField(
        createFieldMetadataItem({
          name: 'userId',
          type: FieldMetadataType.UUID,
          isSystem: true,
        }),
      ),
    ).toBe(false);
  });

  it('should accept system createdAt and updatedAt date fields', () => {
    expect(
      isFieldSupportedAsChartGroupBySubField(
        createFieldMetadataItem({
          name: 'createdAt',
          type: FieldMetadataType.DATE_TIME,
          isSystem: true,
        }),
      ),
    ).toBe(true);
    expect(
      isFieldSupportedAsChartGroupBySubField(
        createFieldMetadataItem({
          name: 'updatedAt',
          type: FieldMetadataType.DATE_TIME,
          isSystem: true,
        }),
      ),
    ).toBe(true);
  });

  it('should reject relation and morph relation fields', () => {
    expect(
      isFieldSupportedAsChartGroupBySubField(
        createFieldMetadataItem({ type: FieldMetadataType.RELATION }),
      ),
    ).toBe(false);
    expect(
      isFieldSupportedAsChartGroupBySubField(
        createFieldMetadataItem({ type: FieldMetadataType.MORPH_RELATION }),
      ),
    ).toBe(false);
  });

  it('should reject field types unsupported in group by', () => {
    expect(
      isFieldSupportedAsChartGroupBySubField(
        createFieldMetadataItem({ type: FieldMetadataType.RAW_JSON }),
      ),
    ).toBe(false);
  });
});
