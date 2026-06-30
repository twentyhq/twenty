import { isInputObjectType } from 'graphql';
import { FieldMetadataType } from 'twenty-shared/types';

import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';

describe('TypeMapperService', () => {
  const typeMapperService = new TypeMapperService();

  describe('mapToFilterType', () => {
    it('should map DATE_TIME to a DateTimeFilter input object with operators', () => {
      const filterType = typeMapperService.mapToFilterType(
        FieldMetadataType.DATE_TIME,
      );

      if (!isInputObjectType(filterType)) {
        throw new Error('Expected DATE_TIME filter type to be an input object');
      }

      expect(filterType.name).toBe('DateTimeFilter');

      const fields = filterType.getFields();

      expect(Object.keys(fields).sort()).toEqual([
        'eq',
        'gt',
        'gte',
        'in',
        'is',
        'lt',
        'lte',
        'neq',
      ]);

      for (const operator of ['eq', 'gt', 'gte', 'lt', 'lte', 'neq']) {
        expect(fields[operator].type.toString()).toBe('DateTime');
      }

      expect(fields.in.type.toString()).toBe('[DateTime!]');
      expect(fields.is.type.toString()).toBe('FilterIs');
    });

    it('should map DATE to a DateFilter input object', () => {
      const filterType = typeMapperService.mapToFilterType(
        FieldMetadataType.DATE,
      );

      if (!isInputObjectType(filterType)) {
        throw new Error('Expected DATE filter type to be an input object');
      }

      expect(filterType.name).toBe('DateFilter');
    });
  });
});
