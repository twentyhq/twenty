export class CompositeTypeNotFoundException extends Error {
  constructor(type: string) {
    super(`Composite type definition not found for type: ${type}`);
  }
}
