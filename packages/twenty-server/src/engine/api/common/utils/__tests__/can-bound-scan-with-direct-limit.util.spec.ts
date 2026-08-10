import { type SelectQueryBuilder, type ObjectLiteral } from 'typeorm';

import { canBoundScanWithDirectLimit } from 'src/engine/api/common/utils/can-bound-scan-with-direct-limit.util';

type JoinRelation = {
  isOneToMany: boolean;
  isManyToMany: boolean;
};

const queryBuilderWithJoins = (
  relations: (JoinRelation | undefined)[],
): SelectQueryBuilder<ObjectLiteral> =>
  ({
    expressionMap: {
      joinAttributes: relations.map((relation) => ({ relation })),
    },
  }) as unknown as SelectQueryBuilder<ObjectLiteral>;

const toOne: JoinRelation = { isOneToMany: false, isManyToMany: false };
const oneToMany: JoinRelation = { isOneToMany: true, isManyToMany: false };
const manyToMany: JoinRelation = { isOneToMany: false, isManyToMany: true };

describe('canBoundScanWithDirectLimit', () => {
  it('should allow a direct limit when there are no joins', () => {
    expect(canBoundScanWithDirectLimit(queryBuilderWithJoins([]))).toBe(true);
  });

  it('should allow a direct limit when every join is to-one', () => {
    expect(
      canBoundScanWithDirectLimit(queryBuilderWithJoins([toOne, toOne])),
    ).toBe(true);
  });

  it('should refuse a direct limit for a one-to-many join, which duplicates root rows', () => {
    expect(
      canBoundScanWithDirectLimit(queryBuilderWithJoins([toOne, oneToMany])),
    ).toBe(false);
  });

  it('should refuse a direct limit for a many-to-many join', () => {
    expect(
      canBoundScanWithDirectLimit(queryBuilderWithJoins([manyToMany])),
    ).toBe(false);
  });

  it('should refuse a direct limit when a join has no resolvable relation', () => {
    expect(
      canBoundScanWithDirectLimit(queryBuilderWithJoins([toOne, undefined])),
    ).toBe(false);
  });
});
