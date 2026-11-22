import { addFormulaFieldDependenciesToSelect } from 'src/engine/api/common/utils/add-formula-field-dependencies-to-select.util';
import { type CommonSelection } from 'src/engine/api/common/types/common-selection.type';
import {
  FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
  FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
  FORMULA_GADGET_FLAT_OBJECT_METADATA_MOCK,
  FORMULA_SUPPLIER_FLAT_OBJECT_METADATA_MOCK,
} from 'src/engine/metadata-modules/formula-field/__mocks__/formula-field-flat-entity-maps.mock';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';

const NO_RESTRICTION: RecordReadRestrictions = {
  unreadableObjectMetadataIds: new Set(),
  unreadableFieldMetadataIds: new Set(),
};

const buildSelection = (
  selection: Partial<CommonSelection> = {},
): CommonSelection => ({
  columns: {},
  aggregates: {},
  relations: {},
  ...selection,
});

const addDependencies = ({
  selection,
  recordReadRestrictions = NO_RESTRICTION,
  flatObjectMetadata = FORMULA_GADGET_FLAT_OBJECT_METADATA_MOCK,
}: {
  selection: CommonSelection;
  recordReadRestrictions?: RecordReadRestrictions;
  flatObjectMetadata?: typeof FORMULA_GADGET_FLAT_OBJECT_METADATA_MOCK;
}) =>
  addFormulaFieldDependenciesToSelect({
    selection,
    flatObjectMetadata,
    recordReadRestrictions,
    flatObjectMetadataMaps: FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
    flatFieldMetadataMaps: FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
  });

describe('addFormulaFieldDependenciesToSelect', () => {
  it('should select the columns a selected formula reads', () => {
    expect(
      addDependencies({
        selection: buildSelection({ columns: { total: true } }),
      }),
    ).toEqual(
      buildSelection({ columns: { total: true, price: true, quantity: true } }),
    );
  });

  it('should leave a selection without formula fields as it is', () => {
    const selection = buildSelection({ columns: { price: true } });

    expect(addDependencies({ selection })).toEqual(selection);
  });

  it('should load the related record a lookup reads', () => {
    expect(
      addDependencies({
        selection: buildSelection({ columns: { supplierLabel: true } }),
      }),
    ).toEqual(
      buildSelection({
        columns: { supplierLabel: true, supplierId: true },
        relations: {
          supplier: {
            fieldName: 'supplier',
            selection: buildSelection({
              columns: {
                name: true,
                revenueAmountMicros: true,
                revenueCurrencyCode: true,
              },
            }),
          },
        },
      }),
    );
  });

  it('should add the looked up columns to a relation the caller already selected', () => {
    expect(
      addDependencies({
        selection: buildSelection({
          columns: { supplierLabel: true },
          relations: {
            supplier: {
              fieldName: 'supplier',
              selection: buildSelection({ columns: { id: true } }),
            },
          },
        }),
      }).relations.supplier?.selection.columns,
    ).toEqual({
      id: true,
      name: true,
      revenueAmountMicros: true,
      revenueCurrencyCode: true,
    });
  });

  it.each([
    {
      reason: 'a field on the record',
      formulaFieldName: 'total',
      recordReadRestrictions: {
        ...NO_RESTRICTION,
        unreadableFieldMetadataIds: new Set(['gadget-quantity']),
      },
    },
    {
      reason: 'the related object',
      formulaFieldName: 'supplierLabel',
      recordReadRestrictions: {
        ...NO_RESTRICTION,
        unreadableObjectMetadataIds: new Set(['supplier-object']),
      },
    },
    {
      reason: 'a field on the related record',
      formulaFieldName: 'supplierLabel',
      recordReadRestrictions: {
        ...NO_RESTRICTION,
        unreadableFieldMetadataIds: new Set(['supplier-revenue']),
      },
    },
  ])(
    'should not load anything for a formula when the caller cannot read $reason',
    ({ formulaFieldName, recordReadRestrictions }) => {
      const selection = buildSelection({
        columns: { [formulaFieldName]: true },
      });

      expect(addDependencies({ selection, recordReadRestrictions })).toEqual(
        selection,
      );
    },
  );

  it('should select what the formulas of a selected related record read', () => {
    expect(
      addDependencies({
        flatObjectMetadata: FORMULA_SUPPLIER_FLAT_OBJECT_METADATA_MOCK,
        selection: buildSelection({ columns: { shout: true } }),
      }).columns,
    ).toEqual({ shout: true, name: true });

    expect(
      addDependencies({
        selection: buildSelection({
          relations: {
            supplier: {
              fieldName: 'supplier',
              selection: buildSelection({ columns: { shout: true } }),
            },
          },
        }),
      }).relations.supplier?.selection.columns,
    ).toEqual({ shout: true, name: true });
  });
});
