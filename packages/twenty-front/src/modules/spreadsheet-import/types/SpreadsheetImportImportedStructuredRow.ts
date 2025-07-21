export type ImportedStructuredRow<T extends string> = {
  [key in T]: string | boolean | undefined;
};
