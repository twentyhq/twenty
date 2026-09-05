/* @license Enterprise */

export type RowLevelPermissionPredicateParent =
  | { roleUniversalIdentifier: string; sharingRuleUniversalIdentifier?: never }
  | { sharingRuleUniversalIdentifier: string; roleUniversalIdentifier?: never };
