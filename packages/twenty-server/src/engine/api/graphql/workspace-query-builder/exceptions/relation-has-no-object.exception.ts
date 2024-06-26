export class RelationHasNoObjectException extends Error {
  constructor(relation: string) {
    super(`Relation ${relation} has no object`);
  }
}
