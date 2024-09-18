import {
  FindOperator,
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from 'typeorm';

import { GraphqlQueryRunnerException } from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { GraphqlQueryFilterOperatorParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-filter/graphql-query-filter-operator.parser';

describe('GraphqlQueryFilterOperatorParser', () => {
  let parser: GraphqlQueryFilterOperatorParser;

  beforeEach(() => {
    parser = new GraphqlQueryFilterOperatorParser();
  });

  describe('parseOperator', () => {
    it('should parse eq operator correctly', () => {
      const result = parser.parseOperator({ eq: 'value' }, false);

      expect(result).toBe('value');
    });

    it('should parse neq operator correctly', () => {
      const result = parser.parseOperator({ neq: 'value' }, false);

      expect(result).toBeInstanceOf(FindOperator);
      expect(result).toEqual(Not('value'));
    });

    it('should parse gt operator correctly', () => {
      const result = parser.parseOperator({ gt: 5 }, false);

      expect(result).toBeInstanceOf(FindOperator);
      expect(result).toEqual(MoreThan(5));
    });

    it('should parse gte operator correctly', () => {
      const result = parser.parseOperator({ gte: 5 }, false);

      expect(result).toBeInstanceOf(FindOperator);
      expect(result).toEqual(MoreThanOrEqual(5));
    });

    it('should parse lt operator correctly', () => {
      const result = parser.parseOperator({ lt: 5 }, false);

      expect(result).toBeInstanceOf(FindOperator);
      expect(result).toEqual(LessThan(5));
    });

    it('should parse lte operator correctly', () => {
      const result = parser.parseOperator({ lte: 5 }, false);

      expect(result).toBeInstanceOf(FindOperator);
      expect(result).toEqual(LessThanOrEqual(5));
    });

    it('should parse in operator correctly', () => {
      const result = parser.parseOperator({ in: [1, 2, 3] }, false);

      expect(result).toBeInstanceOf(FindOperator);
      expect(result).toEqual(In([1, 2, 3]));
    });

    it('should parse is operator with NULL correctly', () => {
      const result = parser.parseOperator({ is: 'NULL' }, false);

      expect(result).toBeInstanceOf(FindOperator);
      expect(result).toEqual(IsNull());
    });

    it('should parse is operator with non-NULL value correctly', () => {
      const result = parser.parseOperator({ is: 'NOT_NULL' }, false);

      expect(result).toBeInstanceOf(FindOperator);
      expect(result).toEqual(Not(IsNull()));
    });

    it('should parse like operator correctly', () => {
      const result = parser.parseOperator({ like: 'test' }, false);

      expect(result).toBeInstanceOf(FindOperator);
      expect(result).toEqual(Like('%test%'));
    });

    it('should parse ilike operator correctly', () => {
      const result = parser.parseOperator({ ilike: 'test' }, false);

      expect(result).toBeInstanceOf(FindOperator);
      expect(result).toEqual(ILike('%test%'));
    });

    it('should parse startsWith operator correctly', () => {
      const result = parser.parseOperator({ startsWith: 'test' }, false);

      expect(result).toBeInstanceOf(FindOperator);
      expect(result).toEqual(ILike('test%'));
    });

    it('should parse endsWith operator correctly', () => {
      const result = parser.parseOperator({ endsWith: 'test' }, false);

      expect(result).toBeInstanceOf(FindOperator);
      expect(result).toEqual(ILike('%test'));
    });

    it('should negate the operator when isNegated is true', () => {
      const result = parser.parseOperator({ eq: 'value' }, true);

      expect(result).toBeInstanceOf(FindOperator);
      expect(result).toEqual(Not('value'));
    });

    it('should throw an exception for unsupported operator', () => {
      expect(() =>
        parser.parseOperator({ unsupported: 'value' }, false),
      ).toThrow(GraphqlQueryRunnerException);
      expect(() =>
        parser.parseOperator({ unsupported: 'value' }, false),
      ).toThrow('Operator "unsupported" is not supported');
    });
  });
});
