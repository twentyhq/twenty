import { FieldMetadataType } from 'twenty-shared/types';

import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '../SettingsCompositeFieldTypeConfigs';

describe('SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS', () => {
  describe('ACTOR field type', () => {
    const actorConfig =
      SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[FieldMetadataType.ACTOR];

    it('should have source subfield as filterable', () => {
      const sourceField = actorConfig.subFields.find(
        (field) => field.subFieldName === 'source',
      );

      expect(sourceField).toBeDefined();
      expect(sourceField?.isFilterable).toBe(true);
    });

    it('should have name subfield as filterable', () => {
      const nameField = actorConfig.subFields.find(
        (field) => field.subFieldName === 'name',
      );

      expect(nameField).toBeDefined();
      expect(nameField?.isFilterable).toBe(true);
    });

    it('should have workspaceMemberId subfield as filterable', () => {
      const workspaceMemberIdField = actorConfig.subFields.find(
        (field) => field.subFieldName === 'workspaceMemberId',
      );

      expect(workspaceMemberIdField).toBeDefined();
      expect(workspaceMemberIdField?.isFilterable).toBe(true);
    });

    it('should have exactly 3 filterable subfields for ACTOR', () => {
      const filterableSubFields = actorConfig.subFields.filter(
        (field) => field.isFilterable === true,
      );

      expect(filterableSubFields).toHaveLength(3);
      expect(filterableSubFields.map((f) => f.subFieldName)).toEqual(
        expect.arrayContaining(['source', 'name', 'workspaceMemberId']),
      );
    });

    it('should have context subfield as NOT filterable', () => {
      const contextField = actorConfig.subFields.find(
        (field) => field.subFieldName === 'context',
      );

      expect(contextField).toBeDefined();
      expect(contextField?.isFilterable).toBe(false);
    });
  });

  describe('other composite field types', () => {
    it('should have CURRENCY subfields as filterable', () => {
      const currencyConfig =
        SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[FieldMetadataType.CURRENCY];

      const filterableSubFields = currencyConfig.subFields.filter(
        (field) => field.isFilterable === true,
      );

      expect(filterableSubFields.length).toBeGreaterThan(0);
    });

    it('should have FULL_NAME subfields as filterable', () => {
      const fullNameConfig =
        SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[FieldMetadataType.FULL_NAME];

      const filterableSubFields = fullNameConfig.subFields.filter(
        (field) => field.isFilterable === true,
      );

      expect(filterableSubFields.length).toBeGreaterThan(0);
    });
  });
});
