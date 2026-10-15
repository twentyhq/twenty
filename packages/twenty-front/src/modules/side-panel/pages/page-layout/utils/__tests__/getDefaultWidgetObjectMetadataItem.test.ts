import { getDefaultWidgetObjectMetadataItem } from '@/side-panel/pages/page-layout/utils/getDefaultWidgetObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

describe('getDefaultWidgetObjectMetadataItem', () => {
  const company = getMockObjectMetadataItemOrThrow(
    CoreObjectNameSingular.Company,
  );
  const opportunity = getMockObjectMetadataItemOrThrow(
    CoreObjectNameSingular.Opportunity,
  );
  const person = getMockObjectMetadataItemOrThrow(
    CoreObjectNameSingular.Person,
  );

  it('should return the company object when available', () => {
    expect(
      getDefaultWidgetObjectMetadataItem([person, opportunity, company]),
    ).toBe(company);
  });

  it('should return the first object by plural label otherwise', () => {
    expect(getDefaultWidgetObjectMetadataItem([person, opportunity])).toBe(
      opportunity,
    );
  });

  it('should return undefined when there are no objects', () => {
    expect(getDefaultWidgetObjectMetadataItem([])).toBeUndefined();
  });
});
