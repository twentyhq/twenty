import { type AxiosInstance } from 'axios';
import { isDefined } from 'twenty-shared/utils';

import { type CaptchaDriver } from 'src/engine/core-modules/captcha/drivers/interfaces/captcha-driver.interface';
import { type CaptchaServerResponse } from 'src/engine/core-modules/captcha/drivers/interfaces/captcha-server-response';

import {
  type CaptchaDriverOptions,
  type CaptchaValidateResult,
} from 'src/engine/core-modules/captcha/interfaces';

export class GoogleRecaptchaDriver implements CaptchaDriver {
  private readonly _siteKey: string;
  private readonly secretKey: string;
  private readonly minScore: number;
  private readonly httpService: AxiosInstance;
  constructor(
    private _options: CaptchaDriverOptions & { minScore: number },
    httpClient: AxiosInstance,
  ) {
    this._siteKey = _options.siteKey;
    this.secretKey = _options.secretKey;
    this.minScore = _options.minScore;
    this.httpService = httpClient;
  }

  async validate(token: string): Promise<CaptchaValidateResult> {
    const formData = new URLSearchParams({
      secret: this.secretKey,
      response: token,
    });

    const response = await this.httpService.post('', formData);
    const responseData = response.data as CaptchaServerResponse;

    if (!responseData.success) {
      return {
        success: false,
        error: responseData['error-codes']?.[0] ?? 'unknown-error',
      };
    }

    const { score, action } = responseData;

    // v2 keys return no score, and v3 marks any valid token as success whatever its score
    if (isDefined(score) && score < this.minScore) {
      return { success: false, error: 'low-score', score, action };
    }

    return { success: true, score, action };
  }
}
