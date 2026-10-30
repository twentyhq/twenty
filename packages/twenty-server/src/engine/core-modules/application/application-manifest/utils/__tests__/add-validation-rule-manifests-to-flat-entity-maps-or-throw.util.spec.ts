import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { addValidationRuleManifestsToFlatEntityMapsOrThrow } from 'src/engine/core-modules/application/application-manifest/utils/add-validation-rule-manifests-to-flat-entity-maps-or-throw.util';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';

const OWNER_APPLICATION = {
  id: 'owner-application-id',
  universalIdentifier: 'owner-application',
};
const NOW = '2026-10-20T00:00:00.000Z';

const buildField = (
  field: Pick<
    FlatFieldMetadata,
    | 'universalIdentifier'
    | 'name'
    | 'type'
    | 'objectMetadataUniversalIdentifier'
  > &
    Partial<FlatFieldMetadata>,
) =>
  ({
    isActive: true,
    applicationId: 'other-application-id',
    universalSettings: null,
    relationTargetObjectMetadataUniversalIdentifier: null,
    ...field,
  }) as FlatFieldMetadata;

const buildMaps = () => {
  const existingAllFlatEntityMaps = createEmptyAllFlatEntityMaps();
  const toAllUniversalFlatEntityMaps = createEmptyAllFlatEntityMaps();

  existingAllFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier.company =
    { universalIdentifier: 'company' } as FlatObjectMetadata;
  existingAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier.employees =
    buildField({
      universalIdentifier: 'employees',
      name: 'employees',
      type: FieldMetadataType.NUMBER,
      objectMetadataUniversalIdentifier: 'company',
    });
  existingAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier.removedCode =
    buildField({
      universalIdentifier: 'removedCode',
      name: 'removedCode',
      type: FieldMetadataType.TEXT,
      objectMetadataUniversalIdentifier: 'ticket',
      applicationId: OWNER_APPLICATION.id,
    });

  toAllUniversalFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier.ticket =
    {
      universalIdentifier: 'ticket',
      applicationUniversalIdentifier: '20202020-0000-4000-8000-000000000001',
    } as FlatObjectMetadata;
  toAllUniversalFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier.reference =
    buildField({
      universalIdentifier: 'reference',
      name: 'reference',
      type: FieldMetadataType.TEXT,
      objectMetadataUniversalIdentifier: 'ticket',
    });
  toAllUniversalFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier.company =
    buildField({
      universalIdentifier: 'company',
      name: 'company',
      type: FieldMetadataType.RELATION,
      objectMetadataUniversalIdentifier: 'ticket',
      universalSettings: { relationType: RelationType.MANY_TO_ONE },
      relationTargetObjectMetadataUniversalIdentifier: 'company',
    } as Partial<FlatFieldMetadata> as FlatFieldMetadata);

  return { existingAllFlatEntityMaps, toAllUniversalFlatEntityMaps };
};

describe('addValidationRuleManifestsToFlatEntityMapsOrThrow', () => {
  it('binds own fields and fields of other applications reached through a relation', () => {
    const maps = buildMaps();

    addValidationRuleManifestsToFlatEntityMapsOrThrow({
      validationRules: [
        {
          universalIdentifier: 'rule',
          objectUniversalIdentifier: 'ticket',
          name: ' Large companies need a reference ',
          expression: 'company.employees < 100 or isNonEmptyString(reference)',
          message: 'Add a reference',
          errorFieldUniversalIdentifier: 'reference',
        },
      ],
      ownerFlatApplication: OWNER_APPLICATION,
      inferDeletionFromMissingEntities: true,
      ...maps,
      now: NOW,
    });

    expect(
      maps.toAllUniversalFlatEntityMaps.flatValidationRuleMaps
        .byUniversalIdentifier.rule,
    ).toEqual({
      universalIdentifier: 'rule',
      applicationUniversalIdentifier: OWNER_APPLICATION.universalIdentifier,
      objectMetadataUniversalIdentifier: 'ticket',
      errorFieldMetadataUniversalIdentifier: 'reference',
      name: 'Large companies need a reference',
      description: null,
      icon: null,
      expression: 'company.employees < 100 or isNonEmptyString(reference)',
      bindings: {
        company: 'company',
        'company.employees': 'employees',
        reference: 'reference',
      },
      message: 'Add a reference',
      isActive: true,
      createdAt: NOW,
      updatedAt: NOW,
    });
  });

  it('rejects an expression reading a field the manifest removes', () => {
    expect(() =>
      addValidationRuleManifestsToFlatEntityMapsOrThrow({
        validationRules: [
          {
            universalIdentifier: 'rule',
            objectUniversalIdentifier: 'ticket',
            name: 'Ticket has a code',
            expression: 'isNonEmptyString(removedCode)',
            message: 'Add a code',
          },
        ],
        ownerFlatApplication: OWNER_APPLICATION,
        inferDeletionFromMissingEntities: true,
        ...buildMaps(),
        now: NOW,
      }),
    ).toThrow(
      'Validation rule "Ticket has a code" has an invalid expression: Unknown field "removedCode"',
    );
  });

  describe('when a field the rule reads is unavailable', () => {
    const RULE = {
      universalIdentifier: 'rule',
      objectUniversalIdentifier: 'company',
      name: 'Company has employees',
      expression: 'employees > 0',
      message: 'Add employees',
    };
    const EXISTING_RULE = {
      universalIdentifier: 'rule',
      expression: RULE.expression,
      bindings: { employees: 'employees' },
      isActive: true,
    } as unknown as FlatValidationRule;

    const sync = (maps: ReturnType<typeof buildMaps>) =>
      addValidationRuleManifestsToFlatEntityMapsOrThrow({
        validationRules: [RULE],
        ownerFlatApplication: OWNER_APPLICATION,
        inferDeletionFromMissingEntities: true,
        ...maps,
        now: NOW,
      });
    const syncedRule = (maps: ReturnType<typeof buildMaps>) =>
      maps.toAllUniversalFlatEntityMaps.flatValidationRuleMaps
        .byUniversalIdentifier.rule;

    it('leaves the rule inactive and warns when the workspace deactivated a field', () => {
      const maps = buildMaps();

      maps.existingAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier.employees =
        buildField({
          universalIdentifier: 'employees',
          name: 'employees',
          type: FieldMetadataType.NUMBER,
          objectMetadataUniversalIdentifier: 'company',
          applicationUniversalIdentifier: 'other-application',
          universalOverrides: { workspace: { isActive: false } },
        } as Partial<FlatFieldMetadata> as FlatFieldMetadata);

      const { warnings } = sync(maps);

      expect(warnings).toEqual([
        expect.stringContaining('"employees", which is deactivated'),
      ]);
      expect(syncedRule(maps)).toMatchObject({ isActive: false, bindings: {} });
    });

    it('leaves an existing rule inactive and warns when its field left the workspace', () => {
      const maps = buildMaps();

      maps.existingAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier.employees =
        undefined;
      maps.existingAllFlatEntityMaps.flatValidationRuleMaps.byUniversalIdentifier.rule =
        EXISTING_RULE;

      const { warnings } = sync(maps);

      expect(warnings).toEqual([
        expect.stringContaining('"employees", which no longer exists'),
      ]);
      expect(syncedRule(maps)).toMatchObject({
        isActive: false,
        bindings: EXISTING_RULE.bindings,
      });
    });

    it('fails with a clear error when the application removed the field itself', () => {
      const maps = buildMaps();

      maps.existingAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier.employees =
        undefined;
      maps.existingAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier.ownEmployees =
        buildField({
          universalIdentifier: 'ownEmployees',
          name: 'employeeCount',
          type: FieldMetadataType.NUMBER,
          objectMetadataUniversalIdentifier: 'company',
          applicationId: OWNER_APPLICATION.id,
        });
      maps.existingAllFlatEntityMaps.flatValidationRuleMaps.byUniversalIdentifier.rule =
        { ...EXISTING_RULE, bindings: { employees: 'ownEmployees' } };

      expect(() => sync(maps)).toThrow(
        'Validation rule "Company has employees" uses the field "employees", which no longer exists. Update the rule\'s expression or add the field back to your app.',
      );
    });

    it('fails when a new rule names a field that exists nowhere', () => {
      const maps = buildMaps();

      expect(() =>
        addValidationRuleManifestsToFlatEntityMapsOrThrow({
          validationRules: [{ ...RULE, expression: 'employes > 0' }],
          ownerFlatApplication: OWNER_APPLICATION,
          inferDeletionFromMissingEntities: true,
          ...maps,
          now: NOW,
        }),
      ).toThrow('Unknown field "employes"');
    });
  });

  it('keeps a rule off once it exists, and turns a new rule on', () => {
    const maps = buildMaps();

    maps.existingAllFlatEntityMaps.flatValidationRuleMaps.byUniversalIdentifier.off =
      { isActive: false, universalIdentifier: 'off' } as FlatValidationRule;

    const { warnings } = addValidationRuleManifestsToFlatEntityMapsOrThrow({
      validationRules: ['off', 'new'].map((universalIdentifier) => ({
        universalIdentifier,
        objectUniversalIdentifier: 'ticket',
        name: universalIdentifier,
        expression: 'isNonEmptyString(reference)',
        message: 'Add a reference',
      })),
      ownerFlatApplication: OWNER_APPLICATION,
      inferDeletionFromMissingEntities: true,
      ...maps,
      now: NOW,
    });

    const { byUniversalIdentifier } =
      maps.toAllUniversalFlatEntityMaps.flatValidationRuleMaps;

    expect(warnings).toEqual([]);
    expect(byUniversalIdentifier.off?.isActive).toBe(false);
    expect(byUniversalIdentifier.new?.isActive).toBe(true);
  });

  describe('fields that remain after the sync', () => {
    const buildRule = (expression: string) => ({
      universalIdentifier: 'rule',
      objectUniversalIdentifier: 'ticket',
      name: 'Rule',
      expression,
      message: 'Message',
    });

    it('reads the reserved fields of an object this sync creates', () => {
      const maps = buildMaps();

      addValidationRuleManifestsToFlatEntityMapsOrThrow({
        validationRules: [buildRule('isDefined(createdAt)')],
        ownerFlatApplication: OWNER_APPLICATION,
        inferDeletionFromMissingEntities: true,
        ...maps,
        now: NOW,
      });

      expect(
        maps.toAllUniversalFlatEntityMaps.flatValidationRuleMaps
          .byUniversalIdentifier.rule?.isActive,
      ).toBe(true);
    });

    it('reads an existing engine-owned field the manifest does not declare', () => {
      const maps = buildMaps();

      maps.existingAllFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier.ticket =
        { universalIdentifier: 'ticket' } as FlatObjectMetadata;
      maps.existingAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier.updatedAt =
        buildField({
          universalIdentifier: 'updatedAt',
          name: 'updatedAt',
          type: FieldMetadataType.DATE_TIME,
          objectMetadataUniversalIdentifier: 'ticket',
          applicationId: OWNER_APPLICATION.id,
          isSystemSideEffect: true,
        });

      const { warnings } = addValidationRuleManifestsToFlatEntityMapsOrThrow({
        validationRules: [buildRule('isDefined(updatedAt)')],
        ownerFlatApplication: OWNER_APPLICATION,
        inferDeletionFromMissingEntities: true,
        ...maps,
        now: NOW,
      });

      expect(warnings).toEqual([]);
    });

    it('reads a field the manifest dropped when the sync does not prune', () => {
      const maps = buildMaps();

      const { warnings } = addValidationRuleManifestsToFlatEntityMapsOrThrow({
        validationRules: [buildRule('isNonEmptyString(removedCode)')],
        ownerFlatApplication: OWNER_APPLICATION,
        inferDeletionFromMissingEntities: false,
        ...maps,
        now: NOW,
      });

      expect(warnings).toEqual([]);
    });
  });

  describe('when the declared error field is missing', () => {
    const RULE = {
      universalIdentifier: 'rule',
      objectUniversalIdentifier: 'ticket',
      name: 'Rule',
      expression: 'isNonEmptyString(reference)',
      message: 'Message',
      errorFieldUniversalIdentifier: 'deletedField',
    };

    it('keeps the link detached and warns when the workspace deleted the field', () => {
      const maps = buildMaps();

      maps.existingAllFlatEntityMaps.flatValidationRuleMaps.byUniversalIdentifier.rule =
        {
          universalIdentifier: 'rule',
          isActive: true,
          errorFieldMetadataUniversalIdentifier: null,
        } as FlatValidationRule;

      const { warnings } = addValidationRuleManifestsToFlatEntityMapsOrThrow({
        validationRules: [RULE],
        ownerFlatApplication: OWNER_APPLICATION,
        inferDeletionFromMissingEntities: true,
        ...maps,
        now: NOW,
      });

      expect(warnings).toEqual([
        expect.stringContaining('is no longer attached to its error field'),
      ]);
      expect(
        maps.toAllUniversalFlatEntityMaps.flatValidationRuleMaps
          .byUniversalIdentifier.rule,
      ).toMatchObject({
        errorFieldMetadataUniversalIdentifier: null,
        isActive: true,
      });
    });

    it('leaves a new rule pointing at the field so the validator rejects it', () => {
      const maps = buildMaps();

      const { warnings } = addValidationRuleManifestsToFlatEntityMapsOrThrow({
        validationRules: [RULE],
        ownerFlatApplication: OWNER_APPLICATION,
        inferDeletionFromMissingEntities: true,
        ...maps,
        now: NOW,
      });

      expect(warnings).toEqual([]);
      expect(
        maps.toAllUniversalFlatEntityMaps.flatValidationRuleMaps
          .byUniversalIdentifier.rule?.errorFieldMetadataUniversalIdentifier,
      ).toBe('deletedField');
    });
  });

  it('rejects a rule on an unknown object', () => {
    expect(() =>
      addValidationRuleManifestsToFlatEntityMapsOrThrow({
        validationRules: [
          {
            universalIdentifier: 'rule',
            objectUniversalIdentifier: 'unknown',
            name: 'Orphan rule',
            expression: 'true',
            message: 'Never shown',
          },
        ],
        ownerFlatApplication: OWNER_APPLICATION,
        inferDeletionFromMissingEntities: true,
        ...buildMaps(),
        now: NOW,
      }),
    ).toThrow(
      'Validation rule "Orphan rule" references unknown object unknown',
    );
  });
});
