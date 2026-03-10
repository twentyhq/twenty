import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { DEFAULT_COMPANY_RECORD_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultCompanyRecordPageLayoutId';
import { DEFAULT_PERSON_RECORD_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultPersonRecordPageLayoutId';
import { DEFAULT_RECORD_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultRecordPageLayoutId';
import { getRecordPageLayoutId } from '@/page-layout/utils/getRecordPageLayoutId';
import { CoreObjectNameSingular } from 'twenty-shared/types';

const createMockRecord = (
  overrides: Partial<ObjectRecord> = {},
): ObjectRecord => ({
  id: 'record-1',
  __typename: 'ObjectRecord',
  ...overrides,
});

describe('getRecordPageLayoutId', () => {
  it('should return null when record is null', () => {
    const result = getRecordPageLayoutId({
      record: null,
      targetObjectNameSingular: CoreObjectNameSingular.Company,
    });

    expect(result).toBeNull();
  });

  it('should return null when record is undefined', () => {
    const result = getRecordPageLayoutId({
      record: undefined,
      targetObjectNameSingular: CoreObjectNameSingular.Company,
    });

    expect(result).toBeNull();
  });

  it('should return record.pageLayoutId when it is defined', () => {
    const record = createMockRecord({ pageLayoutId: 'custom-layout-123' });

    const result = getRecordPageLayoutId({
      record,
      targetObjectNameSingular: CoreObjectNameSingular.Company,
    });

    expect(result).toBe('custom-layout-123');
  });

  it('should return Company default layout for Company object', () => {
    const record = createMockRecord();

    const result = getRecordPageLayoutId({
      record,
      targetObjectNameSingular: CoreObjectNameSingular.Company,
    });

    expect(result).toBe(DEFAULT_COMPANY_RECORD_PAGE_LAYOUT_ID);
  });

  it('should return Person default layout for Person object', () => {
    const record = createMockRecord();

    const result = getRecordPageLayoutId({
      record,
      targetObjectNameSingular: CoreObjectNameSingular.Person,
    });

    expect(result).toBe(DEFAULT_PERSON_RECORD_PAGE_LAYOUT_ID);
  });

  it('should return generic default layout for unknown object type', () => {
    const record = createMockRecord();

    const result = getRecordPageLayoutId({
      record,
      targetObjectNameSingular: 'customObject',
    });

    expect(result).toBe(DEFAULT_RECORD_PAGE_LAYOUT_ID);
  });
});
