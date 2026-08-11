import { type SelectQueryBuilder, type ObjectLiteral } from 'typeorm';

import { getNonToOneJoinAliases } from 'src/engine/api/common/utils/get-non-to-one-join-aliases.util';

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

describe('getNonToOneJoinAliases', () => {
  it('should return no alias when every join is to-one', () => {
    expect(
      getNonToOneJoinAliases(
        queryBuilderWithJoins([
          { alias: 'company', relation: toOne },
          { alias: 'event', relation: toOne },
        ]),
      ),
    ).toEqual([]);
  });

  it('should return the alias of a one-to-many join, which duplicates root rows', () => {
    expect(
      getNonToOneJoinAliases(
        queryBuilderWithJoins([
          { alias: 'company', relation: toOne },
          { alias: 'people', relation: oneToMany },
        ]),
      ),
    ).toEqual(['people']);
  });

  it('should return the alias of a join whose relation cannot be resolved', () => {
    expect(
      getNonToOneJoinAliases(
        queryBuilderWithJoins([
          { alias: 'company', relation: toOne },
          { alias: 'rawJoin' },
        ]),
      ),
    ).toEqual(['rawJoin']);
  });
});
