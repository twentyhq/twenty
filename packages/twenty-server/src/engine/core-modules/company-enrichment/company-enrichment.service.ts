import { Injectable } from '@nestjs/common';

import { isWorkEmail } from 'src/utils/is-work-email';
import { getDomainNameByEmail } from 'src/utils/get-domain-name-by-email';

@Injectable()
export class CompanyEnrichmentService {
  private readonly TWENTY_ICONS_BASE_URL = 'https://twenty-icons.com';

  async getCompanyLogoUrl(email: string): Promise<string | undefined> {
    if (!isWorkEmail(email)) {
      return undefined;
    }

    const domain = getDomainNameByEmail(email);

    return `${this.TWENTY_ICONS_BASE_URL}/${domain}`;
  }

  // Future enrichment methods can be added here
  // async getCompanyData(email: string): Promise<CompanyEnrichmentData> {
  //   // Pull data from twenty-companies.com
  // }
}
