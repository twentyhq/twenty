import { CoreObjectNameSingular } from 'twenty-shared/types';

import { getTargetFieldNameForObjectRecord } from 'src/engine/core-modules/target/utils/get-target-field-name-for-object-record.util';

describe('getTargetFieldNameForObjectRecord', () => {
  it.each([
    [CoreObjectNameSingular.Person, 'targetPersonId'],
    [CoreObjectNameSingular.Company, 'targetCompanyId'],
    [CoreObjectNameSingular.Opportunity, 'targetOpportunityId'],
  ])('maps %s to %s', (objectNameSingular, targetFieldName) => {
    expect(getTargetFieldNameForObjectRecord(objectNameSingular)).toBe(
      targetFieldName,
    );
  });

  it('keeps custom objects on the related-person fallback', () => {
    expect(getTargetFieldNameForObjectRecord('pet')).toBeNull();
  });
});
