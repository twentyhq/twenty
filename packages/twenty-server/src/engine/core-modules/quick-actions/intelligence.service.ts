import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { CompanyInteface } from 'src/engine/core-modules/quick-actions/interfaces/company.interface';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';

@Injectable()
export class IntelligenceService {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly httpService: HttpService,
  ) {}

  async enrichCompany(domainName: string): Promise<CompanyInteface> {
    const enrichedCompany = await this.httpService.axiosRef.get(
      `https://companies.twenty.com/${domainName}`,
      {
        validateStatus: function () {
          // This ensures the promise is always resolved, preventing axios from throwing an error
          return true;
        },
      },
    );

    if (enrichedCompany.status !== 200) {
      return {};
    }

    return {
      linkedinLinkUrl: `https://linkedin.com/` + enrichedCompany.data.handle,
    };
  }

  async completeWithAi(content: string) {
    return this.httpService.axiosRef.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        headers: {
          Authorization: `Bearer ${this.environmentService.get(
            'OPENROUTER_API_KEY',
          )}`,
          'HTTP-Referer': `https://twenty.com`,
          'X-Title': `Twenty CRM`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistralai/mixtral-8x7b-instruct',
          messages: [{ role: 'user', content: content }],
        }),
      },
    );
  }
}
