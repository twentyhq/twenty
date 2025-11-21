import { getServerlessFunctionBaseFile } from '../get-serverless-function-base-file';

describe('getServerlessFunctionBaseFile', () => {
  it('should render proper file', () => {
    expect(
      getServerlessFunctionBaseFile({
        name: 'serverless-function-name',
        universalIdentifier: '71e45a58-41da-4ae4-8b73-a543c0a9d3d4',
      }),
    )
      .toBe(`import { type ServerlessFunctionConfig } from 'twenty-sdk/application';

export const main = async (params: {
  a: string;
  b: number;
}): Promise<{ message: string }> => {
  const { a, b } = params;

  // Rename the parameters and code below with your own logic
  // This is just an example
  const message = \`Hello, input: \${a} and \${b}\`;

  return { message };
};

export const config: ServerlessFunctionConfig = {
  universalIdentifier: '71e45a58-41da-4ae4-8b73-a543c0a9d3d4',
  name: 'serverless-function-name',
  timeoutSeconds: 5,
};

`);
  });
});
