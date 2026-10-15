import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { computeRelationFilterDisplayValue } from '@/views/utils/computeRelationFilterDisplayValue';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const buildPerson = (firstName: string, lastName: string): ObjectRecord => ({
  __typename: 'Person',
  id: `person-${firstName}`,
  name: { firstName, lastName },
});

const buildCompany = (name: string): ObjectRecord => ({
  __typename: 'Company',
  id: `company-${name}`,
  name,
});

describe('computeRelationFilterDisplayValue', () => {
  it('should list the selected record names from every morph target object', () => {
    const displayValue = computeRelationFilterDisplayValue({
      targetObjectMetadataItems: [
        personObjectMetadataItem,
        companyObjectMetadataItem,
      ],
      selectedRecordsByObjectNamePlural: {
        [personObjectMetadataItem.namePlural]: [buildPerson('Ada', 'Lovelace')],
        [companyObjectMetadataItem.namePlural]: [buildCompany('Acme')],
      },
      isCurrentWorkspaceMemberSelected: false,
    });

    expect(displayValue).toBe('Ada Lovelace, Acme');
  });

  it('should prepend Me when the current workspace member is selected', () => {
    const displayValue = computeRelationFilterDisplayValue({
      targetObjectMetadataItems: [companyObjectMetadataItem],
      selectedRecordsByObjectNamePlural: {
        [companyObjectMetadataItem.namePlural]: [buildCompany('Acme')],
      },
      isCurrentWorkspaceMemberSelected: true,
    });

    expect(displayValue).toBe('Me, Acme');
  });

  it('should count records across morph target objects when there are too many to list', () => {
    const displayValue = computeRelationFilterDisplayValue({
      targetObjectMetadataItems: [
        personObjectMetadataItem,
        companyObjectMetadataItem,
      ],
      selectedRecordsByObjectNamePlural: {
        [personObjectMetadataItem.namePlural]: [
          buildPerson('Ada', 'Lovelace'),
          buildPerson('Alan', 'Turing'),
        ],
        [companyObjectMetadataItem.namePlural]: [
          buildCompany('Acme'),
          buildCompany('Globex'),
        ],
      },
      isCurrentWorkspaceMemberSelected: false,
    });

    expect(displayValue).toBe('4 records');
  });

  it('should count records with the object label when there is a single target object', () => {
    const displayValue = computeRelationFilterDisplayValue({
      targetObjectMetadataItems: [companyObjectMetadataItem],
      selectedRecordsByObjectNamePlural: {
        [companyObjectMetadataItem.namePlural]: [
          buildCompany('Acme'),
          buildCompany('Globex'),
          buildCompany('Initech'),
          buildCompany('Umbrella'),
        ],
      },
      isCurrentWorkspaceMemberSelected: false,
    });

    expect(displayValue).toBe(
      `4 ${companyObjectMetadataItem.labelPlural.toLowerCase()}`,
    );
  });

  it('should return an empty value when no record is selected', () => {
    const displayValue = computeRelationFilterDisplayValue({
      targetObjectMetadataItems: [
        personObjectMetadataItem,
        companyObjectMetadataItem,
      ],
      selectedRecordsByObjectNamePlural: {},
      isCurrentWorkspaceMemberSelected: false,
    });

    expect(displayValue).toBe('');
  });
});
