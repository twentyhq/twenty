export const cleanGraphQLResponse = (input: any) => {
  if (!input) return null;
  const output = {};
  const topLevelData = {};

  const isObject = (obj: any) => {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
  };

  Object.keys(input).forEach((key) => {
    if (input[key] && input[key].edges) {
      // Store the cleaned nodes directly under the 'data' key
      topLevelData[key] = input[key].edges.map((edge) =>
        cleanGraphQLResponse(edge.node),
      );
      // Handle pageInfo and totalCount at the top level of the output
      if (input[key].pageInfo) {
        output['pageInfo'] = input[key].pageInfo;
      }
      if (input[key].totalCount) {
        output['totalCount'] = input[key].totalCount;
      }
    } else if (isObject(input[key])) {
      // Recursively clean and store objects
      topLevelData[key] = cleanGraphQLResponse(input[key]);
    } else if (key !== '__typename') {
      // Copy other properties directly
      topLevelData[key] = input[key];
    }
  });

  output['data'] = topLevelData;

  return output;
};
