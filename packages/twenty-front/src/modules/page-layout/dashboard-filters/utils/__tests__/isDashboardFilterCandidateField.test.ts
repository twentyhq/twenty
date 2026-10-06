import { buildField } from '@/page-layout/dashboard-filters/testing/dashboardFilterTestFixtures';
import {
  getDashboardFilterSlotFilterTypeForField,
  isDashboardFilterCandidateField,
} from '@/page-layout/dashboard-filters/utils/isDashboardFilterCandidateField';
import { FieldMetadataType } from 'twenty-shared/types';

describe('isDashboardFilterCandidateField', () => {
  it.each([
    FieldMetadataType.TEXT,
    FieldMetadataType.BOOLEAN,
    FieldMetadataType.DATE,
    FieldMetadataType.DATE_TIME,
    FieldMetadataType.SELECT,
    FieldMetadataType.MULTI_SELECT,
  ])('accepts an active %s field', (type) => {
    expect(
      isDashboardFilterCandidateField(
        buildField({ id: 'field', name: 'field', type }),
      ),
    ).toBe(true);
  });

  it('accepts a many-to-one relation', () => {
    expect(
      isDashboardFilterCandidateField(
        buildField({
          id: 'field',
          name: 'owner',
          type: FieldMetadataType.RELATION,
          relationTargetObjectMetadataId: 'target',
        }),
      ),
    ).toBe(true);
  });

  it.each([
    FieldMetadataType.NUMBER,
    FieldMetadataType.CURRENCY,
    FieldMetadataType.UUID,
    FieldMetadataType.RAW_JSON,
  ])('rejects a %s field, which no slot type covers', (type) => {
    expect(
      isDashboardFilterCandidateField(
        buildField({ id: 'field', name: 'field', type }),
      ),
    ).toBe(false);
  });

  it('rejects an inactive field', () => {
    expect(
      isDashboardFilterCandidateField({
        ...buildField({
          id: 'field',
          name: 'field',
          type: FieldMetadataType.TEXT,
        }),
        isActive: false,
      }),
    ).toBe(false);
  });

  it('maps a field type to the slot filter type it can carry', () => {
    expect(
      getDashboardFilterSlotFilterTypeForField({
        type: FieldMetadataType.DATE,
      }),
    ).toBe('DATE');
    expect(
      getDashboardFilterSlotFilterTypeForField({
        type: FieldMetadataType.UUID,
      }),
    ).toBeNull();
  });
});
