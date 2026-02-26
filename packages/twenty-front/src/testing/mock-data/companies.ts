import { type Company } from '@/companies/types/Company';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';
import { mockedCompanyRecords } from '~/testing/mock-data/generated/data/companies/mock-companies-data';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const allMockedCompanyRecords = mockedCompanyRecords as ObjectRecord[];

export const getCompaniesMock = () => {
  return [...allMockedCompanyRecords] as Company[];
};

export const getCompaniesRecordConnectionMock = () => {
  return [...allMockedCompanyRecords];
};

export const getMockCompanyObjectMetadataItem = () => {
  return getMockObjectMetadataItemOrThrow('company');
};

export const getCompanyDuplicateMock = () => {
  return {
    ...allMockedCompanyRecords[0],
    id: '8b40856a-2ec9-4c03-8bc0-c032c89e1824',
  };
};

export const getMockCompanyRecord = (
  overrides?: Partial<ObjectRecord>,
  index = 0,
) => {
  return {
    ...allMockedCompanyRecords[index],
    ...overrides,
  };
};

export const findMockCompanyRecord = ({
  id: queriedCompanyId,
}: Pick<ObjectRecord, 'id'>) => {
  const company = allMockedCompanyRecords.find(
    ({ id: currentCompanyId }) => currentCompanyId === queriedCompanyId,
  );

  if (!isDefined(company)) {
    throw new Error(`Could not find company with id, ${queriedCompanyId}`);
  }

  return company;
};
