// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cleanGraphQLResponse = (input: any) => {
  if (!input) return null;
  const output = { data: {} }; // Initialize the output with a data key at the top level

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isObject = (obj: any) => {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cleanObject = (obj: any) => {
    const cleanedObj = {};

    Object.keys(obj).forEach((key) => {
      if (isObject(obj[key])) {
        if (obj[key].edges) {
          // Handle edges by mapping over them and applying cleanObject to each node
          // @ts-expect-error legacy noImplicitAny
          cleanedObj[key] = obj[key].edges.map((edge) =>
            cleanObject(edge.node),
          );
        } else {
          // Recursively clean nested objects
          // @ts-expect-error legacy noImplicitAny
          cleanedObj[key] = cleanObject(obj[key]);
        }
      } else {
        // Directly assign non-object properties
        // @ts-expect-error legacy noImplicitAny
        cleanedObj[key] = obj[key];
      }
    });

    return cleanedObj;
  };

  Object.keys(input).forEach((key) => {
    if (isObject(input[key]) && input[key].edges) {
      // Handle collections with edges, ensuring data is placed under the data key
      // @ts-expect-error legacy noImplicitAny
      output.data[key] = input[key].edges.map((edge) => cleanObject(edge.node));
      // Move pageInfo and totalCount to the top level
      if (input[key].pageInfo) {
        // @ts-expect-error legacy noImplicitAny
        output['pageInfo'] = input[key].pageInfo;
      }
      if (input[key].totalCount) {
        // @ts-expect-error legacy noImplicitAny
        output['totalCount'] = input[key].totalCount;
      }
    } else if (isObject(input[key])) {
      // Recursively clean and assign nested objects under the data key
      // @ts-expect-error legacy noImplicitAny
      output.data[key] = cleanObject(input[key]);
    } else if (Array.isArray(input[key])) {
      const itemsWithEdges = input[key].filter((item) => item.edges);
      const cleanedObjArray = itemsWithEdges.map(({ edges, ...item }) => {
        return {
          ...item,
          // @ts-expect-error legacy noImplicitAny
          [key]: edges.map((edge) => cleanObject(edge.node)),
        };
      });

      output.data = cleanedObjArray;
    } else {
      // Assign all other properties directly under the data key
      // @ts-expect-error legacy noImplicitAny
      output.data[key] = input[key];
    }
  });

  return output;
};
