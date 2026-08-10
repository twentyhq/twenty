import { type SelectQueryBuilder, type ObjectLiteral } from 'typeorm';

import { isDefined } from 'twenty-shared/utils';

// `take`/`skip` make TypeORM run its two-phase "distinctAlias" query as soon as
// ANY join is present, and the inner select of that query is the original one
// with ORDER BY and LIMIT stripped. So `first: 1` over a person with 3,500
// participants scans and hydrates all 3,500 rows to return one.
//
// The two-phase query exists because a to-many join duplicates root rows, and
// `LIMIT n` on the joined result would not yield n distinct roots. A to-one
// join cannot duplicate a root row, so when every join is to-one a plain
// `LIMIT` returns exactly the same records with a bounded scan.
//
// A join with no resolvable relation (a raw join on a table or subquery) is
// treated as unsafe, since we cannot prove it does not fan out.
export const canBoundScanWithDirectLimit = <T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
): boolean =>
  queryBuilder.expressionMap.joinAttributes.every(({ relation }) => {
    if (!isDefined(relation)) {
      return false;
    }

    return !relation.isOneToMany && !relation.isManyToMany;
  });
