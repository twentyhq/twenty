import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';

export const expectRestCreateInputValidationError = async (
  objectMetadataPluralName: string,
  input: any,
) => {
  const response = await makeRestAPIRequest({
    method: 'post',
    path: `/${objectMetadataPluralName}`,
    body: input,
  });

  expect(response.body.error).toBeDefined();
  expect(JSON.stringify(response.body.messages)).toMatchSnapshot();
};
