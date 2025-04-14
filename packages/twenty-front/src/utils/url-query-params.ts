type QueryParamHandlers = {
  [paramName: string]: (value: string) => void;
};

export const parseQueryParamsAndUpdateState = (
  search: string,
  handlers: QueryParamHandlers,
) => {
  const queryParams = new URLSearchParams(search);

  // Process all query parameters
  for (const [paramName, handler] of Object.entries(handlers)) {
    const value = queryParams.get(paramName);
    if (value !== null) {
      handler(value);
    }
  }
};
