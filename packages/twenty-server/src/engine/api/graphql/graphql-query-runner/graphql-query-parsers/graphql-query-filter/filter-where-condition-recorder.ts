import { type Brackets, type WhereExpressionBuilder } from 'typeorm';

type BracketsLike = Pick<Brackets, 'whereFactory'>;

const isBracketsLike = (condition: unknown): condition is BracketsLike =>
  typeof (condition as BracketsLike | undefined)?.whereFactory === 'function';

// Lightweight stand-in for a query builder that records whether the filter
// parser emits at least one real WHERE predicate, without building any SQL.
// Feeding it through the regular parser lets us reuse the exact filter
// traversal (and / or / not / relation / composite / leaf) instead of
// duplicating that branching to detect "empty but defined" filters such as
// `{ name: {} }` or `{ company: {} }`, which parse into empty brackets.
export class FilterWhereConditionRecorder {
  public hasWhereCondition = false;

  // `addRelationJoinAliasToQueryBuilder` reads/writes these when a relation
  // sub-filter is traversed; the recorder keeps them as harmless no-ops.
  public expressionMap = { joinAttributes: [] as { alias: { name: string } }[] };

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
