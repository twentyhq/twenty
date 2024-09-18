import axios, { AxiosInstance } from 'axios';

import { CaptchaDriver } from 'src/engine/core-modules/captcha/drivers/interfaces/captcha-driver.interface';
import { CaptchaServerResponse } from 'src/engine/core-modules/captcha/drivers/interfaces/captcha-server-response';

import {
  CaptchaDriverOptions,
  CaptchaValidateResult,
} from 'src/engine/core-modules/captcha/interfaces';

export class TurnstileDriver implements CaptchaDriver {
  private readonly siteKey: string;
  private readonly secretKey: string;
  private readonly httpService: AxiosInstance;
  constructor(private options: CaptchaDriverOptions) {
    this.siteKey = options.siteKey;
    this.secretKey = options.secretKey;
    this.httpService = axios.create({
      baseURL: 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    });
  }

  async validate(token: string): Promise<CaptchaValidateResult> {
    const formData = new URLSearchParams({
      secret: this.secretKey,
      response: token,
    });
    const response = await this.httpService.post('', formData);

    const responseData = response.data as CaptchaServerResponse;

    return {
      success: responseData.success,
      ...(!responseData.success && {
        error: responseData['error-codes']?.[0] ?? 'Captcha Error',
      }),
    };
  }
}
