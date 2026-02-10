export const getBuiltHandlerPathFromSourceHandlerPath = (
  sourceHandlerPath: string,
) => {
  return sourceHandlerPath.replace(/\.(tsx?|TSX?)$/, '.mjs');
};
