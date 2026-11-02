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
  private readonly httpService: Pick<AxiosInstance, 'post'>;
  constructor(
    private _options: CaptchaDriverOptions & { minScore: number },
    httpClient: Pick<AxiosInstance, 'post'>,
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

    const { score } = responseData;

    if (isDefined(score) && score < this.minScore) {
      return { success: false, error: 'score-below-threshold', score };
    }

    return { success: true, score };
  }
}
