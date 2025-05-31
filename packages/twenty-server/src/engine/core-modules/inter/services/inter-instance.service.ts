import { Injectable } from '@nestjs/common';

import fs from 'fs';
import https from 'https';

import axios, { AxiosInstance, AxiosResponse } from 'axios';

import {
  GetAuthTokenInput,
  GetAuthTokenResponse,
} from 'src/engine/core-modules/inter/interfaces/auth.interface';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class InterInstanceService {
  private interAxiosInstance: AxiosInstance;

  constructor(private readonly twentyConfigService: TwentyConfigService) {
    if (!twentyConfigService.get('IS_BILLING_ENABLED')) return;

    const interBaseUrl = twentyConfigService.get('INTER_BASE_URL');

    if (!interBaseUrl) throw new Error('INTER_BASE_URL is not configured');

    const certPath = `${process.cwd()}/${twentyConfigService.get('INTER_SECRET_CERT_PATH')}`;
    const keyPath = `${process.cwd()}/${twentyConfigService.get('INTER_SECRET_KEY_PATH')}`;

    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath))
      throw new Error('Inter secret files not found');

    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
    });

    this.interAxiosInstance = axios.create({
      baseURL: this.twentyConfigService.get('INTER_BASE_URL'),
      httpsAgent,
    });
  }

  getInterAxiosInstance(): AxiosInstance {
    return this.interAxiosInstance;
  }

  async getOauthToken(): Promise<string> {
    const response = await this.getInterAxiosInstance().post<
      GetAuthTokenResponse,
      AxiosResponse<GetAuthTokenResponse, GetAuthTokenInput>,
      GetAuthTokenInput
    >('/oauth/v2/token', {
      client_id: this.twentyConfigService.get('INTER_CLIENT_ID'),
      client_secret: this.twentyConfigService.get('INTER_CLIENT_SECRET'),
      grant_type: 'client_credentials',
      // TODO: Find a cleaner way to do this
      scope:
        'cob.write cob.read cobv.write cobv.read lotecobv.write lotecobv.read pix.write pix.read webhook.write webhook.read payloadlocation.write payloadlocation.read boleto-cobranca.read boleto-cobranca.write extrato.read pagamento-pix.write pagamento-pix.read extrato-usend.read pagamento-boleto.read pagamento-boleto.write pagamento-darf.write pagamento-lote.write pagamento-lote.read webhook-banking.read webhook-banking.write pagamento-pix.read',
    });

    return response.data.access_token;
  }
}
