import axios, { AxiosInstance } from 'axios';

import { CaptchaDriver } from 'src/engine/integrations/captcha/drivers/interfaces/captcha-driver.interface';

import {
  CaptchaDriverOptions,
  CaptchaValidateResult,
} from 'src/engine/integrations/captcha/interfaces';

export type TurnstileServerResponse = {
  success: boolean;
  challenge_ts: string;
  hostname: string;
  'error-codes': string[];
};

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

    const responseData = response.data as TurnstileServerResponse;

    return {
      success: responseData.success,
      ...(!responseData.success && {
        error: responseData['error-codes']?.[0] ?? 'Captcha Error',
      }),
    };
  }
}
