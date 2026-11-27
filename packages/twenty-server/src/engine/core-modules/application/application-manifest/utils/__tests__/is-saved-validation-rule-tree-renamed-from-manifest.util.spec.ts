/* @license Enterprise */

import { FieldMetadataType } from 'twenty-shared/types';

import { isSavedValidationRuleTreeRenamedFromManifest } from 'src/engine/core-modules/application/application-manifest/utils/is-saved-validation-rule-tree-renamed-from-manifest.util';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';

const OWNER_APPLICATION = { id: 'owner-application-id' };

// account.headcount > 10 and previous.stage != "WON", read by identifier
const SAVED_TREE = {
  type: 'GROUP' as const,
  logicalOperator: 'AND' as const,
  children: [
    {
      type: 'COMPARISON' as const,
      operator: 'GREATER_THAN' as const,
      left: {
        type: 'FIELD' as const,
        relationFieldUniversalIdentifier: 'company',
        fieldUniversalIdentifier: 'employees',
      },
      right: { type: 'LITERAL' as const, value: 10 },
    },
    {
      type: 'COMPARISON' as const,
      operator: 'NOT_EQUAL' as const,
      left: {
        type: 'FIELD' as const,
        fieldUniversalIdentifier: 'stage',
        isPreviousValue: true,
      },
      right: { type: 'LITERAL' as const, value: 'WON' },
    },
  ],
};

const isRenamed = (manifestExpression: string) => {
  const existingAllFlatEntityMaps = createEmptyAllFlatEntityMaps();
  const { byUniversalIdentifier } =
    existingAllFlatEntityMaps.flatFieldMetadataMaps;

  byUniversalIdentifier.company = getFlatFieldMetadataMock({
    universalIdentifier: 'company',
    name: 'account',
    type: FieldMetadataType.RELATION,
    objectMetadataId: 'ticket-id',
    applicationId: 'other-application-id',
  });
  byUniversalIdentifier.employees = getFlatFieldMetadataMock({
    universalIdentifier: 'employees',
    name: 'headcount',
    type: FieldMetadataType.NUMBER,
    objectMetadataId: 'company-id',
    applicationId: 'other-application-id',
  });
  byUniversalIdentifier.stage = getFlatFieldMetadataMock({
    universalIdentifier: 'stage',
    name: 'stage',
    type: FieldMetadataType.SELECT,
    objectMetadataId: 'ticket-id',
    applicationId: OWNER_APPLICATION.id,
  });

  return isSavedValidationRuleTreeRenamedFromManifest({
    manifestExpression,
    savedTree: SAVED_TREE,
    ownerFlatApplication: OWNER_APPLICATION,
    existingAllFlatEntityMaps,
  });
};

describe('isSavedValidationRuleTreeRenamedFromManifest', () => {
  it.each([
    'account.headcount > 10 and previous.stage != "WON"',
    'company.employees > 10 and previous.stage != "WON"',
    'company.headcount   >   10 and previous.stage != "WON"',
  ])(
    'should keep a rule the manifest names with old names of fields outside the app: %s',
    (manifestExpression) => {
      expect(isRenamed(manifestExpression)).toBe(true);
    },
  );

  it.each([
    'company.employees > 5 and previous.stage != "WON"',
    'company.employees > 10 and previous.phase != "WON"',
    'company.employees > 10 and stage != "WON"',
    'company.employees.amountMicros > 10 and previous.stage != "WON"',
    'company.employees > 10',
    'company.employees > 10 and',
  ])(
    'should not keep a rule the manifest changed otherwise: %s',
    (manifestExpression) => {
      expect(isRenamed(manifestExpression)).toBe(false);
    },
  );
});
