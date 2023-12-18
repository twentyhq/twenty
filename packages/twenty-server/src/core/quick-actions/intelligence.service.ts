import { Injectable } from '@nestjs/common';

import axios from 'axios';

import { EnvironmentService } from 'src/integrations/environment/environment.service';

@Injectable()
export class IntelligenceService {
  constructor(private readonly environmentService: EnvironmentService) {}

  async enrichCompany(domainName: string): Promise<any> {
    const enrichedCompany = await axios.get(
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
    fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.environmentService.getOpenRouterApiKey()}`,
        'HTTP-Referer': `https://twenty.com`,
        'X-Title': `Twenty CRM`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/mixtral-8x7b-instruct',
        messages: [{ role: 'user', content: content }],
      }),
    });
  }
}
