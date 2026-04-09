import { COMPANY_GQL_FIELDS } from 'test/integration/constants/company-gql-fields.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { mergeManyOperationFactory } from 'test/integration/graphql/utils/merge-many-operation-factory.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';

describe('companies merge resolvers (integration)', () => {
  let createdCompanyIds: string[] = [];

  afterEach(async () => {
    if (createdCompanyIds.length > 0) {
      await deleteRecordsByIds('company', createdCompanyIds);
      createdCompanyIds = [];
    }
  });

  describe('merging links composite fields', () => {
    it('should merge linkedinLink composite field correctly', async () => {
      const createCompaniesOperation = createManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: COMPANY_GQL_FIELDS,
        data: [
          {
            name: 'Company A',
            linkedinLink: {
              primaryLinkUrl: 'https://linkedin.com/company/company-a',
              primaryLinkLabel: 'Main LinkedIn',
              secondaryLinks: [
                {
                  url: 'linkedin.com/company/subsidiary-a1',
                  label: 'Subsidiary A1',
                },
                {
                  url: 'linkedin.com/company/subsidiary-a2',
                  label: 'Subsidiary A2',
                },
              ],
            },
          },
          {
            name: 'Company B',
            linkedinLink: {
              primaryLinkUrl: 'https://linkedin.com/company/company-b',
              primaryLinkLabel: 'Main LinkedIn',
              secondaryLinks: [
                {
                  url: 'linkedin.com/company/subsidiary-b1',
                  label: 'Subsidiary B1',
                },
                {
                  url: 'linkedin.com/company/subsidiary-b2',
                  label: 'Subsidiary B2',
                },
              ],
            },
          },
        ],
      });

      const createResponse = await makeGraphqlAPIRequest(
        createCompaniesOperation,
      );

      expect(createResponse.body.data.createCompanies).toHaveLength(2);

      const company1Id = createResponse.body.data.createCompanies[0].id;
      const company2Id = createResponse.body.data.createCompanies[1].id;

      createdCompanyIds.push(company1Id, company2Id);

      const mergeOperation = mergeManyOperationFactory({
        objectMetadataPluralName: 'companies',
        gqlFields: COMPANY_GQL_FIELDS,
        ids: [company1Id, company2Id],
        conflictPriorityIndex: 0,
      });

      const mergeResponse = await makeGraphqlAPIRequest(mergeOperation);

      expect(mergeResponse.body.errors).toBeUndefined();

      const mergedCompany = mergeResponse.body.data.mergeCompanies;

      expect(mergedCompany.linkedinLink.primaryLinkUrl).toBe(
        'https://linkedin.com/company/company-a',
      );
      expect(mergedCompany.linkedinLink.primaryLinkLabel).toBe('Main LinkedIn');
      expect(mergedCompany.linkedinLink.secondaryLinks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            url: 'https://linkedin.com/company/company-b',
          }),
          expect.objectContaining({
            url: 'linkedin.com/company/subsidiary-a1',
          }),
          expect.objectContaining({
            url: 'linkedin.com/company/subsidiary-a2',
          }),
          expect.objectContaining({
            url: 'linkedin.com/company/subsidiary-b1',
          }),
          expect.objectContaining({
            url: 'linkedin.com/company/subsidiary-b2',
          }),
        ]),
      );
      expect(mergedCompany.linkedinLink.secondaryLinks).toHaveLength(5);
    });

    it('should merge links with deduplication', async () => {
      const createCompaniesOperation = createManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: COMPANY_GQL_FIELDS,
        data: [
          {
            name: 'Tech Corp',
            linkedinLink: {
              primaryLinkUrl: 'https://linkedin.com/company/tech-corp',
              primaryLinkLabel: '',
              secondaryLinks: [
                {
                  url: 'linkedin.com/company/shared-subsidiary',
                  label: 'Shared Sub',
                },
                {
                  url: 'linkedin.com/company/tech-division',
                  label: 'Tech Division',
                },
              ],
            },
          },
          {
            name: 'Corp Tech',
            linkedinLink: {
              primaryLinkUrl: 'https://linkedin.com/company/corp-tech',
              primaryLinkLabel: '',
              secondaryLinks: [
                {
                  url: 'linkedin.com/company/shared-subsidiary',
                  label: 'Shared Sub Different Label',
                },
                {
                  url: 'linkedin.com/company/corp-division',
                  label: 'Corp Division',
                },
              ],
            },
          },
        ],
      });

      const createResponse = await makeGraphqlAPIRequest(
        createCompaniesOperation,
      );
      const company1Id = createResponse.body.data.createCompanies[0].id;
      const company2Id = createResponse.body.data.createCompanies[1].id;

      createdCompanyIds.push(company1Id, company2Id);

      const mergeOperation = mergeManyOperationFactory({
        objectMetadataPluralName: 'companies',
        gqlFields: COMPANY_GQL_FIELDS,
        ids: [company1Id, company2Id],
        conflictPriorityIndex: 0,
      });

      const mergeResponse = await makeGraphqlAPIRequest(mergeOperation);
      const mergedCompany = mergeResponse.body.data.mergeCompanies;

      expect(mergedCompany.linkedinLink.primaryLinkUrl).toBe(
        'https://linkedin.com/company/tech-corp',
      );
      const secondaryLinks = mergedCompany.linkedinLink.secondaryLinks;

      expect(secondaryLinks).toHaveLength(4);

      const urls = secondaryLinks.map((link: { url: string }) => link.url);

      expect(urls).toEqual(
        expect.arrayContaining([
          'https://linkedin.com/company/corp-tech',
          'linkedin.com/company/shared-subsidiary',
          'linkedin.com/company/tech-division',
          'linkedin.com/company/corp-division',
        ]),
      );

      const duplicateCount = urls.filter(
        (url: string) => url === 'linkedin.com/company/shared-subsidiary',
      ).length;

      expect(duplicateCount).toBe(1);
    });

    it('should respect priority index for links unique constraint', async () => {
      const createCompaniesOperation = createManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: COMPANY_GQL_FIELDS,
        data: [
          {
            name: 'Priority First',
            linkedinLink: {
              primaryLinkUrl: 'https://linkedin.com/company/first-priority',
              primaryLinkLabel: 'First Label',
              secondaryLinks: [
                { url: 'linkedin.com/company/first-sub', label: 'First Sub' },
              ],
            },
          },
          {
            name: 'Priority Second',
            linkedinLink: {
              primaryLinkUrl: 'https://linkedin.com/company/second-priority',
              primaryLinkLabel: 'Second Label',
              secondaryLinks: [
                { url: 'linkedin.com/company/second-sub', label: 'Second Sub' },
              ],
            },
          },
        ],
      });

      const createResponse = await makeGraphqlAPIRequest(
        createCompaniesOperation,
      );
      const company1Id = createResponse.body.data.createCompanies[0].id;
      const company2Id = createResponse.body.data.createCompanies[1].id;

      createdCompanyIds.push(company1Id, company2Id);

      const mergeWithPriority1 = mergeManyOperationFactory({
        objectMetadataPluralName: 'companies',
        gqlFields: COMPANY_GQL_FIELDS,
        ids: [company1Id, company2Id],
        conflictPriorityIndex: 1,
      });

      const mergeResponse = await makeGraphqlAPIRequest(mergeWithPriority1);
      const mergedCompany = mergeResponse.body.data.mergeCompanies;

      expect(mergedCompany.linkedinLink.primaryLinkUrl).toBe(
        'https://linkedin.com/company/second-priority',
      );
      expect(mergedCompany.linkedinLink.primaryLinkLabel).toBe('Second Label');
      expect(mergedCompany.linkedinLink.secondaryLinks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            url: 'https://linkedin.com/company/first-priority',
          }),
          expect.objectContaining({ url: 'linkedin.com/company/first-sub' }),
          expect.objectContaining({ url: 'linkedin.com/company/second-sub' }),
        ]),
      );
    });
  });
});
