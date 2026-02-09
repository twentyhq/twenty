import { Injectable } from '@nestjs/common';

import axios, { type AxiosInstance, type CreateAxiosDefaults } from 'axios';

import { getSecureAxiosAdapter } from 'src/engine/core-modules/tool/utils/get-secure-axios-adapter.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class SecureHttpClientService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  // Returns an SSRF-protected HTTP client for external requests
  getHttpClient(config?: CreateAxiosDefaults): AxiosInstance {
    const isSafeModeEnabled = this.twentyConfigService.get(
      'OUTBOUND_HTTP_SAFE_MODE_ENABLED',
    );

    return isSafeModeEnabled
      ? axios.create({ ...config, adapter: getSecureAxiosAdapter() })
      : axios.create(config);
  }

  // Returns a plain HTTP client for requests to trusted internal URLs
  // (e.g., the server's own API endpoints). Not SSRF-protected.
  getInternalHttpClient(config?: CreateAxiosDefaults): AxiosInstance {
    return axios.create(config);
  }
}
