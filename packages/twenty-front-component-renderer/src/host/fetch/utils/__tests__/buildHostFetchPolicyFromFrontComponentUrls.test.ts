import { buildHostFetchPolicyFromFrontComponentUrls } from '../buildHostFetchPolicyFromFrontComponentUrls';

describe('buildHostFetchPolicyFromFrontComponentUrls', () => {
  it('should derive allowed origins from the api, functions and component urls', () => {
    const hostFetchPolicy = buildHostFetchPolicyFromFrontComponentUrls({
      componentUrl:
        'https://components.twenty.test/rest/front-components/component-id',
      apiUrl: 'https://api.twenty.test/graphql',
      functionsBaseUrl: 'https://functions.twenty.test/base',
    });

    expect(hostFetchPolicy.allowedOrigins).toEqual([
      'https://api.twenty.test',
      'https://functions.twenty.test',
      'https://components.twenty.test',
    ]);
  });

  it('should drop undefined urls', () => {
    const hostFetchPolicy = buildHostFetchPolicyFromFrontComponentUrls({
      componentUrl: 'https://api.twenty.test/rest/front-components/id',
    });

    expect(hostFetchPolicy.allowedOrigins).toEqual(['https://api.twenty.test']);
  });

  it('should drop malformed urls', () => {
    const hostFetchPolicy = buildHostFetchPolicyFromFrontComponentUrls({
      componentUrl: 'https://api.twenty.test/rest/front-components/id',
      apiUrl: 'not a url',
    });

    expect(hostFetchPolicy.allowedOrigins).toEqual(['https://api.twenty.test']);
  });

  it('should drop urls with non http schemes', () => {
    const hostFetchPolicy = buildHostFetchPolicyFromFrontComponentUrls({
      componentUrl: 'https://api.twenty.test/rest/front-components/id',
      apiUrl: 'data:text/html,<script>alert(1)</script>',
      functionsBaseUrl: 'file:///etc/passwd',
    });

    expect(hostFetchPolicy.allowedOrigins).toEqual(['https://api.twenty.test']);
  });

  it('should deduplicate identical origins', () => {
    const hostFetchPolicy = buildHostFetchPolicyFromFrontComponentUrls({
      componentUrl: 'https://api.twenty.test/rest/front-components/id',
      apiUrl: 'https://api.twenty.test/graphql',
      functionsBaseUrl: 'https://api.twenty.test/functions',
    });

    expect(hostFetchPolicy.allowedOrigins).toEqual(['https://api.twenty.test']);
  });

  it('should mark the component and sdk client urls as file storage redirectable', () => {
    const hostFetchPolicy = buildHostFetchPolicyFromFrontComponentUrls({
      componentUrl: 'https://api.twenty.test/rest/front-components/id',
      sdkClientUrls: {
        core: 'https://api.twenty.test/sdk-client/application-id/core',
        metadata: 'https://api.twenty.test/sdk-client/application-id/metadata',
      },
    });

    expect(hostFetchPolicy.fileStorageRedirectableUrls).toEqual([
      'https://api.twenty.test/rest/front-components/id',
      'https://api.twenty.test/sdk-client/application-id/core',
      'https://api.twenty.test/sdk-client/application-id/metadata',
    ]);
  });

  it('should mark only the component url as redirectable when sdk client urls are undefined', () => {
    const hostFetchPolicy = buildHostFetchPolicyFromFrontComponentUrls({
      componentUrl: 'https://api.twenty.test/rest/front-components/id',
    });

    expect(hostFetchPolicy.fileStorageRedirectableUrls).toEqual([
      'https://api.twenty.test/rest/front-components/id',
    ]);
  });
});
