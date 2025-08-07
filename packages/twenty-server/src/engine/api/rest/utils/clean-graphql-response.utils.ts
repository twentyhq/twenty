export const cleanGraphQLResponse = (input: unknown) => {
  if (!input) return null;
  const output = { data: {} }; // Initialize the output with a data key at the top level

  const isObject = (obj: unknown) => {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
  };

  const cleanObject = (obj: Record<string, unknown>) => {
    const cleanedObj: Record<string, unknown> = {};

    Object.keys(obj).forEach((key) => {
      if (isObject(obj[key])) {
        const objValue = obj[key] as Record<string, unknown>;

        if (objValue.edges) {
          // Handle edges by mapping over them and applying cleanObject to each node
          cleanedObj[key] = (
            objValue.edges as Array<{ node: Record<string, unknown> }>
          ).map((edge) => cleanObject(edge.node));
        } else {
          // Recursively clean nested objects
          cleanedObj[key] = cleanObject(objValue);
        }
      } else {
        // Directly assign non-object properties
        cleanedObj[key] = obj[key];
      }
    });

    return cleanedObj;
  };

  const inputObj = input as Record<string, unknown>;

  Object.keys(inputObj).forEach((key) => {
    const inputValue = inputObj[key] as Record<string, unknown>;

    if (isObject(inputValue) && inputValue.edges) {
      // Handle collections with edges, ensuring data is placed under the data key
      (output.data as Record<string, unknown>)[key] = (
        inputValue.edges as Array<{ node: Record<string, unknown> }>
      ).map((edge) => cleanObject(edge.node));
      // Move pageInfo and totalCount to the top level
      if (inputValue.pageInfo) {
        (output as Record<string, unknown>)['pageInfo'] = inputValue.pageInfo;
      }
      if (inputValue.totalCount) {
        (output as Record<string, unknown>)['totalCount'] =
          inputValue.totalCount;
      }
    } else if (isObject(inputValue)) {
      // Recursively clean and assign nested objects under the data key
      (output.data as Record<string, unknown>)[key] = cleanObject(inputValue);
    } else if (Array.isArray(inputObj[key])) {
      const inputArray = inputObj[key] as Array<Record<string, unknown>>;
      const itemsWithEdges = inputArray.filter((item) => item.edges);
      const cleanedObjArray = itemsWithEdges.map(({ edges, ...item }) => {
        return {
          ...item,
          [key]: (edges as Array<{ node: Record<string, unknown> }>).map(
            (edge) => cleanObject(edge.node),
          ),
        };
      });

      output.data = cleanedObjArray;
    } else {
      // Assign all other properties directly under the data key
      (output.data as Record<string, unknown>)[key] = inputObj[key];
    }
  });

  return output;
};
