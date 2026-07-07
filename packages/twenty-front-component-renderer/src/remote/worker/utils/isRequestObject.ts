export const isRequestObject = (input: RequestInfo | URL): input is Request =>
  typeof input === 'object' && !(input instanceof URL);
