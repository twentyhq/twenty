export enum ViewFilterOperand {
  Is = 'is',
  IsNotNull = 'isNotNull',
  IsNot = 'isNot',
  LessThanOrEqual = 'lessThan', // TODO: we could change this to 'lessThanOrEqual' for consistency but it would require a migration
  GreaterThanOrEqual = 'greaterThan', // TODO: we could change this to 'greaterThanOrEqual' for consistency but it would require a migration
  IsBefore = 'isBefore',
  IsAfter = 'isAfter',
  Contains = 'contains',
  DoesNotContain = 'doesNotContain',
  IsEmpty = 'isEmpty',
  IsNotEmpty = 'isNotEmpty',
  IsRelative = 'isRelative',
  IsInPast = 'isInPast',
  IsInFuture = 'isInFuture',
  IsToday = 'isToday',
  VectorSearch = 'search',
}
