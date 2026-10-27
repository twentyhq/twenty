import { GoogleRecaptchaDriver } from 'src/engine/core-modules/captcha/drivers/google-recaptcha.driver';

const buildDriver = (siteverifyResponse: Record<string, unknown>) => {
  const httpClient = {
    post: jest.fn().mockResolvedValue({ data: siteverifyResponse }),
  };

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
    });

    expect(await driver.validate('token')).toEqual({
      success: true,
      score: 0.5,
    });
  });

  it('should reject a valid token scoring below the minimum score', async () => {
    const driver = buildDriver({
      success: true,
      score: 0.3,
    });

    expect(await driver.validate('token')).toEqual({
      success: false,
      error: 'score-below-threshold',
      score: 0.3,
    });
  });

  it('should accept a valid token without score', async () => {
    const driver = buildDriver({ success: true });

    expect(await driver.validate('token')).toEqual({
      success: true,
      score: undefined,
    });
  });
});
