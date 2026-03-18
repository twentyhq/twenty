import {
  mockPersonFlatFieldMetadataMaps,
  mockPersonFlatObjectMetadata,
  mockPersonFlatObjectMetadataMaps,
} from 'src/engine/api/graphql/graphql-query-runner/__mocks__/mockPersonObjectMetadata';
import { settings } from 'src/engine/constants/settings';
import { mockCompanyObjectMetadataInfo } from 'src/engine/core-modules/__mocks__/mockObjectMetadataItemsWithFieldMaps';
import { mockPersonRecords } from 'src/engine/api/graphql/graphql-query-runner/__mocks__/mockPersonRecords';
import { buildDuplicateConditions } from 'src/engine/api/utils/build-duplicate-conditions.utils';

describe('buildDuplicateConditions', () => {
  it('should build conditions based on duplicate criteria from composite field', () => {
    const duplicateConditons = buildDuplicateConditions(
      mockPersonFlatObjectMetadata([['emailsPrimaryEmail']]),
      mockPersonFlatObjectMetadataMaps([['emailsPrimaryEmail']]),
      mockPersonFlatFieldMetadataMaps(),
      mockPersonRecords,
      'recordId',
    );

    expect(duplicateConditons).toEqual({
      or: [
        {
          emails: {
            primaryEmail: {
              eq: 'test@test.fr',
            },
          },
        },
      ],
      id: {
        neq: 'recordId',
      },
    });
  });

  it('should build conditions based on duplicate criteria from basic field', () => {
    const duplicateConditons = buildDuplicateConditions(
      mockPersonFlatObjectMetadata([['jobTitle']]),
      mockPersonFlatObjectMetadataMaps([['jobTitle']]),
      mockPersonFlatFieldMetadataMaps(),
      mockPersonRecords,
      'recordId',
    );

    expect(duplicateConditons).toEqual({
      or: [
        {
          jobTitle: {
            eq: 'Test job',
          },
        },
      ],
      id: {
        neq: 'recordId',
      },
    });
  });

  it('should not build conditions based on duplicate criteria if record value is null or too small', () => {
    const duplicateConditons = buildDuplicateConditions(
      mockPersonFlatObjectMetadata([['linkedinLinkPrimaryLinkUrl']]),
      mockPersonFlatObjectMetadataMaps([['linkedinLinkPrimaryLinkUrl']]),
      mockPersonFlatFieldMetadataMaps(),
      mockPersonRecords,
      'recordId',
    );

    expect(duplicateConditons).toEqual({});
  });

  it('should build conditions based on duplicate criteria and without recordId filter', () => {
    const duplicateConditons = buildDuplicateConditions(
      mockPersonFlatObjectMetadata([['jobTitle']]),
      mockPersonFlatObjectMetadataMaps([['jobTitle']]),
      mockPersonFlatFieldMetadataMaps(),
      mockPersonRecords,
    );

    expect(duplicateConditons).toEqual({
      or: [
        {
          jobTitle: {
            eq: 'Test job',
          },
        },
      ],
    });
  });

  it('should exclude short company names while still using other matching duplicate criteria', () => {
    const duplicateConditons = buildDuplicateConditions(
      {
        ...mockCompanyObjectMetadataInfo.flatObjectMetadata,
        duplicateCriteria: [['name'], ['domainNamePrimaryLinkUrl']],
      },
      mockCompanyObjectMetadataInfo.flatObjectMetadataMaps,
      mockCompanyObjectMetadataInfo.flatFieldMetadataMaps,
      [
        {
          name: 'A'.repeat(settings.minLengthOfStringForDuplicateCheck - 1),
          domainName: {
            primaryLinkUrl: 'acme.com',
          },
        },
      ],
    );

    expect(duplicateConditons).toEqual({
      or: [
        {
          domainName: {
            primaryLinkUrl: {
              eq: 'acme.com',
            },
          },
        },
      ],
    });
  });

  it('should build company duplicate conditions from a string domainName payload', () => {
    const duplicateConditons = buildDuplicateConditions(
      {
        ...mockCompanyObjectMetadataInfo.flatObjectMetadata,
        duplicateCriteria: [['domainNamePrimaryLinkUrl']],
      },
      mockCompanyObjectMetadataInfo.flatObjectMetadataMaps,
      mockCompanyObjectMetadataInfo.flatFieldMetadataMaps,
      [
        {
          domainName: 'acme.com',
        },
      ],
    );

    expect(duplicateConditons).toEqual({
      or: [
        {
          domainName: {
            primaryLinkUrl: {
              eq: 'acme.com',
            },
          },
        },
      ],
    });
  });

  it('should build an exact company name condition at the minimum string length boundary', () => {
    const name = 'A'.repeat(settings.minLengthOfStringForDuplicateCheck);
    const duplicateConditons = buildDuplicateConditions(
      {
        ...mockCompanyObjectMetadataInfo.flatObjectMetadata,
        duplicateCriteria: [['name']],
      },
      mockCompanyObjectMetadataInfo.flatObjectMetadataMaps,
      mockCompanyObjectMetadataInfo.flatFieldMetadataMaps,
      [
        {
          name,
        },
      ],
    );

    expect(duplicateConditons).toEqual({
      or: [
        {
          name: {
            eq: name,
          },
        },
      ],
    });
  });

  it('should build separate exact company name and domain conditions when both criteria are present', () => {
    const duplicateConditons = buildDuplicateConditions(
      {
        ...mockCompanyObjectMetadataInfo.flatObjectMetadata,
        duplicateCriteria: [['name'], ['domainNamePrimaryLinkUrl']],
      },
      mockCompanyObjectMetadataInfo.flatObjectMetadataMaps,
      mockCompanyObjectMetadataInfo.flatFieldMetadataMaps,
      [
        {
          name: 'Acme Holdings',
          domainName: {
            primaryLinkUrl: 'https://acme.example',
          },
        },
      ],
    );

    expect(duplicateConditons).toEqual({
      or: [
        {
          name: {
            eq: 'Acme Holdings',
          },
        },
        {
          domainName: {
            primaryLinkUrl: {
              eq: 'https://acme.example',
            },
          },
        },
      ],
    });
  });

  it('should ignore empty company domain values while still using an exact name condition', () => {
    const duplicateConditons = buildDuplicateConditions(
      {
        ...mockCompanyObjectMetadataInfo.flatObjectMetadata,
        duplicateCriteria: [['name'], ['domainNamePrimaryLinkUrl']],
      },
      mockCompanyObjectMetadataInfo.flatObjectMetadataMaps,
      mockCompanyObjectMetadataInfo.flatFieldMetadataMaps,
      [
        {
          name: 'Acme Holdings',
          domainName: {
            primaryLinkUrl: '',
          },
        },
      ],
    );

    expect(duplicateConditons).toEqual({
      or: [
        {
          name: {
            eq: 'Acme Holdings',
          },
        },
      ],
    });
  });
});
