// https://gist.github.com/ManUtopiK/469aec75b655d6a4d912aeb3b75af3c9
export const cleanGraphQLResponse = (input: any) => {
  if (!input) return null;
  const output = {};
  const isObject = (obj: any) => {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
  };

  Object.keys(input).forEach((key) => {
    if (input[key] && input[key].edges) {
      output[key] = input[key].edges.map((edge) =>
        cleanGraphQLResponse(edge.node),
      );
    } else if (isObject(input[key])) {
      output[key] = cleanGraphQLResponse(input[key]);
    } else if (key !== '__typename') {
      output[key] = input[key];
    }
  });

  return output;
};
