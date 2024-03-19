import { Injectable } from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';

import { Record as IRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { isWorkEmail } from 'src/utils/is-work-email';
import { stringifyWithoutKeyQuote } from 'src/engine/api/graphql/workspace-query-builder/utils/stringify-without-key-quote.util';
import { WorkspaceQueryRunnerService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.service';
import { IntelligenceService } from 'src/engine/core-modules/quick-actions/intelligence.service';
import { capitalize } from 'src/utils/capitalize';

@Injectable()
export class QuickActionsService {
  constructor(
    private readonly workspaceQueryRunnunerService: WorkspaceQueryRunnerService,
    private readonly intelligenceService: IntelligenceService,
  ) {}

  async createCompanyFromPerson(
    id: string,
    workspaceId: string,
    objectMetadataItemCollection: ObjectMetadataInterface[],
  ) {
    const personObjectMetadata = objectMetadataItemCollection.find(
      (item) => item.nameSingular === 'person',
    );

    if (!personObjectMetadata) {
      return;
    }

    const personRequest =
      await this.workspaceQueryRunnunerService.executeAndParse<IRecord>(
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
        personObjectMetadata,
        '',
        workspaceId,
      );
    const person = personRequest.edges?.[0]?.node;

    if (!person) {
      return;
    }

    if (!person.companyId && person.email && isWorkEmail(person.email)) {
      const companyDomainName = person.email.split('@')?.[1].toLowerCase();
      const companyName = capitalize(companyDomainName.split('.')[0]);
      let relatedCompanyId = uuidv4();

      const companyObjectMetadata = objectMetadataItemCollection.find(
        (item) => item.nameSingular === 'company',
      );

      if (!companyObjectMetadata) {
        return;
      }

      const existingCompany =
        await this.workspaceQueryRunnunerService.executeAndParse<IRecord>(
          `query {companyCollection(filter: {domainName: {eq: "${companyDomainName}"}}) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          `,
          companyObjectMetadata,
          '',
          workspaceId,
        );

      if (existingCompany.edges?.length) {
        relatedCompanyId = existingCompany.edges[0].node.id;
      }

      await this.workspaceQueryRunnunerService.execute(
        `mutation {
          insertIntocompanyCollection(objects: ${stringifyWithoutKeyQuote([
            {
              id: relatedCompanyId,
              name: companyName,
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

  async executeQuickActionOnCompany(
    id: string,
    workspaceId: string,
    objectMetadataItem: ObjectMetadataInterface,
  ) {
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

    const companyRequest =
      await this.workspaceQueryRunnunerService.executeAndParse<IRecord>(
        companyQuery,
        objectMetadataItem,
        '',
        workspaceId,
      );
    const company = companyRequest.edges?.[0]?.node;

    if (!company) {
      return;
    }

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
      }`,
      workspaceId,
    );
  }
}
