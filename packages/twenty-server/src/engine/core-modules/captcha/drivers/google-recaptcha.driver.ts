import axios, { type AxiosInstance } from 'axios';

import { type CaptchaDriver } from 'src/engine/core-modules/captcha/drivers/interfaces/captcha-driver.interface';
import { type CaptchaServerResponse } from 'src/engine/core-modules/captcha/drivers/interfaces/captcha-server-response';

import {
  type CaptchaDriverOptions,
  type CaptchaValidateResult,
} from 'src/engine/core-modules/captcha/interfaces';

export class GoogleRecaptchaDriver implements CaptchaDriver {
  private readonly _siteKey: string;
  private readonly secretKey: string;
  private readonly httpService: AxiosInstance;
  constructor(private _options: CaptchaDriverOptions) {
    this._siteKey = _options.siteKey;
    this.secretKey = _options.secretKey;
    this.httpService = axios.create({
      baseURL: 'https://www.google.com/recaptcha/api/siteverify',
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
        error: responseData['error-codes']?.[0] ?? 'unknown-error',
      }),
    };
  }
}
