export type SandboxErrorExpectation = {
  requiredErrors: readonly [string | RegExp, ...(string | RegExp)[]];
  allowedAdditionalErrors?: readonly (string | RegExp)[];
};
