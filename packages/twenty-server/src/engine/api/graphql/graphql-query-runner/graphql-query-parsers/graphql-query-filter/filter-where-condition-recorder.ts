import {
  type Brackets,
  type ObjectLiteral,
  type WhereExpressionBuilder,
} from 'typeorm';
import { type JoinAttribute } from 'typeorm/query-builder/JoinAttribute';
import { type QueryExpressionMap } from 'typeorm/query-builder/QueryExpressionMap';

type BracketsLike = Pick<Brackets, 'whereFactory'>;

const isBracketsLike = (condition: unknown): condition is BracketsLike =>
  typeof (condition as BracketsLike | undefined)?.whereFactory === 'function';

// Minimal slice of the query builder that the filter parser actually touches
// while walking a filter: the top-level WHERE bracket and the relation-join
// bookkeeping. Typing the parser against this (instead of the full
// WorkspaceSelectQueryBuilder) lets `FilterWhereConditionRecorder` stand in
// for a real builder WITHOUT an unchecked cast. If the parser ever starts to
// rely on another builder method, it must be added here, which in turn forces
// the recorder to implement it — turning silent runtime drift into a compile
// error.
export type FilterWhereQueryBuilder = {
  where(where: Brackets, parameters?: ObjectLiteral): unknown;
  leftJoin(property: string, alias: string): unknown;
  expressionMap: Pick<QueryExpressionMap, 'joinAttributes'>;
};

// Lightweight stand-in for a query builder that records whether the filter
// parser emits at least one real WHERE predicate, without building any SQL.
// Feeding it through the regular parser lets us reuse the exact filter
// traversal (and / or / not / relation / composite / leaf) instead of
// duplicating that branching to detect "empty but defined" filters such as
// `{ name: {} }` or `{ company: {} }`, which parse into empty brackets.
export class FilterWhereConditionRecorder implements FilterWhereQueryBuilder {
  public hasWhereCondition = false;

  // `addRelationJoinAliasToQueryBuilder` reads/writes these when a relation
  // sub-filter is traversed; the recorder keeps them as harmless no-ops.
  public expressionMap = { joinAttributes: [] as JoinAttribute[] };

  where(condition: unknown): this {
    this.recordCondition(condition);

    return this;
  }

  andWhere(condition: unknown): this {
    this.recordCondition(condition);

    return this;
  }

  orWhere(condition: unknown): this {
    this.recordCondition(condition);

    return this;
  }

  leftJoin(): this {
    return this;
  }

  private recordCondition(condition: unknown): void {
    if (typeof condition === 'string') {
      // Assumption: the field parser only emits non-empty SQL for a real
      // predicate (see `computeWhereConditionParts`). An empty / whitespace
      // string means "no constraint", so it must not flip the flag — that is
      // exactly the empty-but-defined case we are trying to detect.
      if (condition.trim().length > 0) {
        this.hasWhereCondition = true;
      }

      return;
    }

    // Brackets / NotBrackets — recurse so nested predicates are recorded.
    if (isBracketsLike(condition)) {
      condition.whereFactory(this as unknown as WhereExpressionBuilder);
    }
  }
}
