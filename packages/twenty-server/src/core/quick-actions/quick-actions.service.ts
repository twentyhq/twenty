import { Injectable } from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';

import { Record as IRecord } from 'src/workspace/workspace-query-builder/interfaces/record.interface';

import { isWorkEmail } from 'src/utils/is-work-email';
import { stringifyWithoutKeyQuote } from 'src/workspace/workspace-query-builder/utils/stringify-without-key-quote.util';
import { WorkspaceQueryRunnerService } from 'src/workspace/workspace-query-runner/workspace-query-runner.service';
import { IntelligenceService } from 'src/core/quick-actions/intelligence.service';

@Injectable()
export class QuickActionsService {
  constructor(
    private readonly workspaceQueryRunnunerService: WorkspaceQueryRunnerService,
    private readonly intelligenceService: IntelligenceService,
  ) {}

  async createCompanyFromPerson(id: string, workspaceId: string) {
    const person = (
      (await this.workspaceQueryRunnunerService.executeAndParse(
        `query {
        personCollection(filter: {id: {eq: "${id}"}}) {
              edges {
                node {
                  id
                  email
                  companyId
                }
              }
            }
          }
        `,
        'person',
        '',
        workspaceId,
      )) as IRecord
    ).edges?.[0]?.node;

    if (!person.companyId && person.email && isWorkEmail(person.email)) {
      const companyDomainName = person.email.split('@')[1];
      const companyNameSmallCase = companyDomainName.split('.')[0];
      let relatedCompanyId = uuidv4();

      const existingCompany =
        (await this.workspaceQueryRunnunerService.executeAndParse(
          `query {companyCollection(filter: {domainName: {eq: "${companyDomainName}"}}) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          `,
          'company',
          '',
          workspaceId,
        )) as IRecord;

      if (existingCompany.edges?.length) {
        relatedCompanyId = existingCompany.edges[0].node.id;
      }

      await this.workspaceQueryRunnunerService.execute(
        `mutation {
          insertIntocompanyCollection(objects: ${stringifyWithoutKeyQuote([
            {
              id: relatedCompanyId,
              name:
                companyNameSmallCase.charAt(0).toUpperCase() +
                companyNameSmallCase.slice(1),
              domainName: companyDomainName,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ])}) {
            affectedCount
            records {
              id
            }
          }
        }
      `,
        workspaceId,
      );

      await this.workspaceQueryRunnunerService.execute(
        `mutation {
        updatepersonCollection(set: ${stringifyWithoutKeyQuote({
          companyId: relatedCompanyId,
        })}, filter: { id: { eq: "${person.id}" } }) {
          affectedCount
          records {
            id
          }
        }
      }
    `,
        workspaceId,
      );
    }
  }

  async executeQuickActionOnCompany(id: string, workspaceId: string) {
    const companyQuery = `query {
        companyCollection(filter: {id: {eq: "${id}"}}) {
          edges {
            node {
              id
              domainName
              createdAt
              linkedinLinkUrl
            }
          }
        }
      }
    `;

    const company = (
      (await this.workspaceQueryRunnunerService.executeAndParse(
        companyQuery,
        'company',
        '',
        workspaceId,
      )) as IRecord
    ).edges?.[0]?.node;

    const enrichedData = await this.intelligenceService.enrichCompany(
      company.domainName,
    );

    await this.workspaceQueryRunnunerService.execute(
      `mutation {
      updatecompanyCollection(set: ${stringifyWithoutKeyQuote(
        enrichedData,
      )}, filter: { id: { eq: "${id}" } }) {
        affectedCount
        records {
          id
        }
      }
    }
  `,
      workspaceId,
    );
  }
}
