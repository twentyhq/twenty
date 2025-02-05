export const assertUnreachable = (x: any, errorMessage?: string): never => {
  throw new Error(errorMessage ?? "Didn't expect to get here.");
};
