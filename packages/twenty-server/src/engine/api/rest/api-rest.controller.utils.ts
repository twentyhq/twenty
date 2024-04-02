import { Response } from 'express';

import { ApiRestResponse } from 'src/engine/api/rest/types/api-rest-response.type';

// https://gist.github.com/ManUtopiK/469aec75b655d6a4d912aeb3b75af3c9
export const cleanGraphQLResponse = (input) => {
  if (!input) return null;
  const output = {};
  const isObject = (obj) => {
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

export const handleResult = (res: Response, result: ApiRestResponse) => {
  if (result.data.error) {
    res
      .status(result.data.status || 400)
      .send({ error: `${result.data.error}` });
  } else {
    res.send(cleanGraphQLResponse(result.data));
  }
};
