import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { setFormulaFieldBindingsThroughMutation } from 'src/engine/core-modules/application/application-manifest/utils/set-formula-field-bindings-through-mutation.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK } from 'src/engine/metadata-modules/formula-field/__mocks__/formula-field-flat-entity-maps.mock';

const buildManifestField = ({
  name,
  expression,
}: {
  name: string;
  expression?: string;
}) =>
  getFlatFieldMetadataMock({
    universalIdentifier: `manifest-${name}-uid`,
    name,
    type: FieldMetadataType.NUMBER,
    objectMetadataId: 'gadget-object',
    objectMetadataUniversalIdentifier: 'gadget-object-uid',
    formula: isDefined(expression) ? { expression } : null,
  });

describe('setFormulaFieldBindingsThroughMutation', () => {
  it('should bind a manifest formula to workspace fields and to fields of the same manifest', () => {
    const discount = buildManifestField({ name: 'discount' });
    const netPrice = buildManifestField({
      name: 'netPrice',
      expression: 'price - discount',
    });
    const universalFlatFieldMetadataMapsToMutate = {
      byUniversalIdentifier: {
        [discount.universalIdentifier]: discount,
        [netPrice.universalIdentifier]: netPrice,
      },
    };

    setFormulaFieldBindingsThroughMutation({
      existingFlatFieldMetadataMaps: FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK,
      universalFlatFieldMetadataMapsToMutate,
    });

    expect(
      universalFlatFieldMetadataMapsToMutate.byUniversalIdentifier,
    ).toMatchObject({
      [discount.universalIdentifier]: { universalSettings: null },
      [netPrice.universalIdentifier]: {
        formula: {
          expression: 'price - discount',
          bindings: {
            price: 'gadget-price-uid',
            discount: discount.universalIdentifier,
          },
        },
      },
    });
  });
});
