// Shim for the `typescript` module.
// Only the TypeFlags constants used by the ported rules are needed.
// The type-aware code paths guard on typeChecker !== null so these are
// never actually evaluated inside oxlint's sandbox.

export const TypeFlags = {
  BooleanLike: 528, // Boolean | BooleanLiteral (16 | 512)
  Union: 1048576,
  StringLiteral: 128,
};

export default { TypeFlags };
