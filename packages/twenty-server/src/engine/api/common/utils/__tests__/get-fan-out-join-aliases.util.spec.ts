import { type SelectQueryBuilder, type ObjectLiteral } from 'typeorm';

import { getFanOutJoinAliases } from 'src/engine/api/common/utils/get-fan-out-join-aliases.util';

type JoinRelation = {
  isOneToMany: boolean;
  isManyToMany: boolean;
};

const queryBuilderWithJoins = (
  joins: { alias: string; relation?: JoinRelation }[],
): SelectQueryBuilder<ObjectLiteral> =>
  ({
    expressionMap: {
      joinAttributes: joins.map(({ alias, relation }) => ({
        alias: { name: alias },
        relation,
      })),
    },
  }) as unknown as SelectQueryBuilder<ObjectLiteral>;

const toOne: JoinRelation = { isOneToMany: false, isManyToMany: false };
const oneToMany: JoinRelation = { isOneToMany: true, isManyToMany: false };
const manyToMany: JoinRelation = { isOneToMany: false, isManyToMany: true };

describe('getFanOutJoinAliases', () => {
  it('should return no alias when there are no joins', () => {
    expect(getFanOutJoinAliases(queryBuilderWithJoins([]))).toEqual([]);
  });

  it('should return no alias when every join is to-one', () => {
    expect(
      getFanOutJoinAliases(
        queryBuilderWithJoins([
          { alias: 'company', relation: toOne },
          { alias: 'event', relation: toOne },
        ]),
      ),
    ).toEqual([]);
  });

  it('should return the alias of a one-to-many join, which duplicates root rows', () => {
    expect(
      getFanOutJoinAliases(
        queryBuilderWithJoins([
          { alias: 'company', relation: toOne },
          { alias: 'people', relation: oneToMany },
        ]),
      ),
    ).toEqual(['people']);
  });

  it('should return the alias of a many-to-many join', () => {
    expect(
      getFanOutJoinAliases(
        queryBuilderWithJoins([{ alias: 'tags', relation: manyToMany }]),
      ),
    ).toEqual(['tags']);
  });

  it('should return the alias of a join with no resolvable relation', () => {
    expect(
      getFanOutJoinAliases(
        queryBuilderWithJoins([
          { alias: 'company', relation: toOne },
          { alias: 'rawJoin' },
        ]),
      ),
    ).toEqual(['rawJoin']);
  });
});
