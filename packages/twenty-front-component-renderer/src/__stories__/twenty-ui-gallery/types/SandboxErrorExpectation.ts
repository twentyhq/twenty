export type SandboxErrorExpectation = {
  requiredErrors: readonly [string | RegExp, ...(string | RegExp)[]];
};
