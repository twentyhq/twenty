import { type AxiosInstance } from 'axios';

import { GoogleRecaptchaDriver } from 'src/engine/core-modules/captcha/drivers/google-recaptcha.driver';

const buildDriver = (siteverifyResponse: Record<string, unknown>) => {
  const httpClient = {
    post: jest.fn().mockResolvedValue({ data: siteverifyResponse }),
  } as unknown as AxiosInstance;

  return new GoogleRecaptchaDriver(
    { siteKey: 'site-key', secretKey: 'secret-key', minScore: 0.5 },
    httpClient,
  );
};

describe('GoogleRecaptchaDriver', () => {
  it('should accept a token scoring at or above the minimum score', async () => {
    const driver = buildDriver({
      success: true,
      score: 0.5,
      action: 'create_workspace',
    });

    expect(await driver.validate('token')).toEqual({
      success: true,
      score: 0.5,
      action: 'create_workspace',
    });
  });

  it('should reject a valid token scoring below the minimum score', async () => {
    const driver = buildDriver({
      success: true,
      score: 0.3,
      action: 'submit',
    });

    expect(await driver.validate('token')).toEqual({
      success: false,
      error: 'low-score',
      score: 0.3,
      action: 'submit',
    });
  });

  it('should accept a valid token without score', async () => {
    const driver = buildDriver({ success: true });

    expect(await driver.validate('token')).toEqual({
      success: true,
      score: undefined,
      action: undefined,
    });
  });

  it('should reject an invalid token with its error code', async () => {
    const driver = buildDriver({
      success: false,
      'error-codes': ['timeout-or-duplicate'],
    });

    expect(await driver.validate('token')).toEqual({
      success: false,
      error: 'timeout-or-duplicate',
    });
  });
});
