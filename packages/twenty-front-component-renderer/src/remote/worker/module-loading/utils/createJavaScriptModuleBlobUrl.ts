export const createJavaScriptModuleBlobUrl = (source: string): string =>
  URL.createObjectURL(new Blob([source], { type: 'application/javascript' }));
