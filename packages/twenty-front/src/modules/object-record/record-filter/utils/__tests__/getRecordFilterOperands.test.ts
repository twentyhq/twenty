import { ViewFilterOperand } from 'twenty-shared/types';

import { getRecordFilterOperands } from '../getRecordFilterOperands';

describe('getRecordFilterOperands', () => {
  describe('ACTOR field type', () => {
    it('should return CONTAINS, DOES_NOT_CONTAIN, IS_EMPTY, IS_NOT_EMPTY for default ACTOR filter (name subfield)', () => {
      const operands = getRecordFilterOperands({
        filterType: 'ACTOR',
        subFieldName: undefined,
      });

      expect(operands).toContain(ViewFilterOperand.CONTAINS);
      expect(operands).toContain(ViewFilterOperand.DOES_NOT_CONTAIN);
      expect(operands).toContain(ViewFilterOperand.IS_EMPTY);
      expect(operands).toContain(ViewFilterOperand.IS_NOT_EMPTY);
      expect(operands).not.toContain(ViewFilterOperand.IS);
      expect(operands).not.toContain(ViewFilterOperand.IS_NOT);
    });

    it('should return IS, IS_NOT, IS_EMPTY, IS_NOT_EMPTY for source subfield', () => {
      const operands = getRecordFilterOperands({
        filterType: 'ACTOR',
        subFieldName: 'source',
      });

      expect(operands).toContain(ViewFilterOperand.IS);
      expect(operands).toContain(ViewFilterOperand.IS_NOT);
      expect(operands).toContain(ViewFilterOperand.IS_EMPTY);
      expect(operands).toContain(ViewFilterOperand.IS_NOT_EMPTY);
      expect(operands).not.toContain(ViewFilterOperand.CONTAINS);
      expect(operands).not.toContain(ViewFilterOperand.DOES_NOT_CONTAIN);
    });

    it('should return IS, IS_NOT, IS_EMPTY, IS_NOT_EMPTY for workspaceMemberId subfield', () => {
      const operands = getRecordFilterOperands({
        filterType: 'ACTOR',
        subFieldName: 'workspaceMemberId',
      });

      expect(operands).toContain(ViewFilterOperand.IS);
      expect(operands).toContain(ViewFilterOperand.IS_NOT);
      expect(operands).toContain(ViewFilterOperand.IS_EMPTY);
      expect(operands).toContain(ViewFilterOperand.IS_NOT_EMPTY);
      expect(operands).not.toContain(ViewFilterOperand.CONTAINS);
      expect(operands).not.toContain(ViewFilterOperand.DOES_NOT_CONTAIN);
    });

    it('should return name subfield operands for null subFieldName', () => {
      const operands = getRecordFilterOperands({
        filterType: 'ACTOR',
        subFieldName: null,
      });

      expect(operands).toContain(ViewFilterOperand.CONTAINS);
      expect(operands).toContain(ViewFilterOperand.DOES_NOT_CONTAIN);
    });

    it('should return name subfield operands for "name" subFieldName', () => {
      const operands = getRecordFilterOperands({
        filterType: 'ACTOR',
        subFieldName: 'name',
      });

      expect(operands).toContain(ViewFilterOperand.CONTAINS);
      expect(operands).toContain(ViewFilterOperand.DOES_NOT_CONTAIN);
    });
  });

  describe('RELATION field type', () => {
    it('should return IS, IS_NOT, IS_EMPTY, IS_NOT_EMPTY for RELATION', () => {
      const operands = getRecordFilterOperands({
        filterType: 'RELATION',
        subFieldName: undefined,
      });

      expect(operands).toContain(ViewFilterOperand.IS);
      expect(operands).toContain(ViewFilterOperand.IS_NOT);
      expect(operands).toContain(ViewFilterOperand.IS_EMPTY);
      expect(operands).toContain(ViewFilterOperand.IS_NOT_EMPTY);
    });
  });

  describe('TEXT field type', () => {
    it('should return CONTAINS, DOES_NOT_CONTAIN, IS_EMPTY, IS_NOT_EMPTY for TEXT', () => {
      const operands = getRecordFilterOperands({
        filterType: 'TEXT',
        subFieldName: undefined,
      });

      expect(operands).toContain(ViewFilterOperand.CONTAINS);
      expect(operands).toContain(ViewFilterOperand.DOES_NOT_CONTAIN);
      expect(operands).toContain(ViewFilterOperand.IS_EMPTY);
      expect(operands).toContain(ViewFilterOperand.IS_NOT_EMPTY);
    });
  });

  describe('SELECT field type', () => {
    it('should return IS, IS_NOT, IS_EMPTY, IS_NOT_EMPTY for SELECT', () => {
      const operands = getRecordFilterOperands({
        filterType: 'SELECT',
        subFieldName: undefined,
      });

      expect(operands).toContain(ViewFilterOperand.IS);
      expect(operands).toContain(ViewFilterOperand.IS_NOT);
      expect(operands).toContain(ViewFilterOperand.IS_EMPTY);
      expect(operands).toContain(ViewFilterOperand.IS_NOT_EMPTY);
    });
  });

  describe('NUMBER field type', () => {
    it('should return IS, IS_NOT, GREATER_THAN_OR_EQUAL, LESS_THAN_OR_EQUAL, IS_EMPTY, IS_NOT_EMPTY for NUMBER', () => {
      const operands = getRecordFilterOperands({
        filterType: 'NUMBER',
        subFieldName: undefined,
      });

      expect(operands).toContain(ViewFilterOperand.IS);
      expect(operands).toContain(ViewFilterOperand.IS_NOT);
      expect(operands).toContain(ViewFilterOperand.GREATER_THAN_OR_EQUAL);
      expect(operands).toContain(ViewFilterOperand.LESS_THAN_OR_EQUAL);
      expect(operands).toContain(ViewFilterOperand.IS_EMPTY);
      expect(operands).toContain(ViewFilterOperand.IS_NOT_EMPTY);
    });
  });

  describe('BOOLEAN field type', () => {
    it('should return only IS for BOOLEAN', () => {
      const operands = getRecordFilterOperands({
        filterType: 'BOOLEAN',
        subFieldName: undefined,
      });

      expect(operands).toEqual([ViewFilterOperand.IS]);
    });
  });
});

