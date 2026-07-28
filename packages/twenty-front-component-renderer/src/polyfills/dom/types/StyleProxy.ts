export type StyleProxy = {
  cssText: string;
  setProperty: (
    cssPropertyName: string,
    value: string | null,
    priority?: string,
  ) => void;
  removeProperty: (cssPropertyName: string) => string;
  getPropertyValue: (cssPropertyName: string) => string;
  [stylePropertyName: string]: unknown;
};
