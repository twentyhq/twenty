import { Injectable } from '@nestjs/common';

import axios, { type AxiosInstance } from 'axios';

import { getSecureAdapter } from 'src/engine/core-modules/tool/utils/get-secure-axios-adapter.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class SecureHttpClientService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  getHttpClient(): AxiosInstance {
    const isSafeModeEnabled = this.twentyConfigService.get(
      'OUTBOUND_HTTP_SAFE_MODE_ENABLED',
    );

    return isSafeModeEnabled
      ? axios.create({ adapter: getSecureAdapter() })
      : axios.create();
  }
}
