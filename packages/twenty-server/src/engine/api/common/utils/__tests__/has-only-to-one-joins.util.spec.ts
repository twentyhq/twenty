import { type SelectQueryBuilder, type ObjectLiteral } from 'typeorm';

import { hasOnlyToOneJoins } from 'src/engine/api/common/utils/has-only-to-one-joins.util';

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

describe('hasOnlyToOneJoins', () => {
  it('should return true when there are no joins', () => {
    expect(hasOnlyToOneJoins(queryBuilderWithJoins([]))).toBe(true);
  });

  it('should return true when every join is to-one', () => {
    expect(hasOnlyToOneJoins(queryBuilderWithJoins([toOne, toOne]))).toBe(true);
  });

  it('should return false when a one-to-many join can duplicate root rows', () => {
    expect(hasOnlyToOneJoins(queryBuilderWithJoins([toOne, oneToMany]))).toBe(
      false,
    );
  });

  it('should return false when a many-to-many join can duplicate root rows', () => {
    expect(hasOnlyToOneJoins(queryBuilderWithJoins([manyToMany]))).toBe(false);
  });

  it('should return false when a join has no resolvable relation', () => {
    expect(hasOnlyToOneJoins(queryBuilderWithJoins([toOne, undefined]))).toBe(
      false,
    );
  });
});
