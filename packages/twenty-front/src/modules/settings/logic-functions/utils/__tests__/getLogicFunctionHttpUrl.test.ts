import { getLogicFunctionHttpUrl } from '@/settings/logic-functions/utils/getLogicFunctionHttpUrl';

describe('getLogicFunctionHttpUrl', () => {
  it('appends the path to the functions base URL', () => {
    expect(
      getLogicFunctionHttpUrl({
        functionsBaseUrl: 'https://acme.withtwenty.com',
        path: '/webhook/stripe',
      }),
    ).toBe('https://acme.withtwenty.com/webhook/stripe');
  });

  it('normalizes a path that does not start with a slash', () => {
    expect(
      getLogicFunctionHttpUrl({
        functionsBaseUrl: 'https://api.twenty.com/s',
        path: 'webhook',
      }),
    ).toBe('https://api.twenty.com/s/webhook');
  });
});
