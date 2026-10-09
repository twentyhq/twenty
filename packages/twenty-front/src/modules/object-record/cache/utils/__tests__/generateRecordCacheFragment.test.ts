import { Kind, print } from 'graphql';

import { generateRecordCacheFragment } from '@/object-record/cache/utils/generateRecordCacheFragment';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

const personObjectMetadataItem = objectMetadataItems.find(
  (item) => item.nameSingular === 'person',
);

if (!personObjectMetadataItem) {
  throw new Error('Object metadata not found');
}

const objectPermissionsByObjectMetadataId = {
  [personObjectMetadataItem.id]: {
    canReadObjectRecords: true,
    canUpdateObjectRecords: true,
    canSoftDeleteObjectRecords: true,
    canDestroyObjectRecords: true,
    objectMetadataId: personObjectMetadataItem.id,
    restrictedFields: {},
    rowLevelPermissionPredicates: [],
    rowLevelPermissionPredicateGroups: [],
  },
};

const generatePersonFragment = (recordGqlFields: Record<string, boolean>) =>
  generateRecordCacheFragment({
    objectMetadataItems,
    objectMetadataItem: personObjectMetadataItem,
    recordGqlFields,
    objectPermissionsByObjectMetadataId,
  });

describe('generateRecordCacheFragment', () => {
  it('should name the fragment after the object', () => {
    const fragment = generatePersonFragment({ id: true, jobTitle: true });

    const [definition] = fragment.definitions;

    expect(definition.kind).toBe(Kind.FRAGMENT_DEFINITION);
    expect(print(fragment)).toContain('fragment PersonFragment on Person');
  });

  it('should return the same document for the same selection', () => {
    const firstFragment = generatePersonFragment({ id: true, city: true });
    const secondFragment = generatePersonFragment({ id: true, city: true });

    expect(secondFragment).toBe(firstFragment);
  });

  it('should build distinct documents for different selections without warning', () => {
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    const cityFragment = generatePersonFragment({ id: true, city: true });
    const emailsFragment = generatePersonFragment({ id: true, emails: true });

    expect(emailsFragment).not.toBe(cityFragment);
    expect(print(cityFragment)).toContain('city');
    expect(print(emailsFragment)).not.toContain('city');
    expect(consoleWarnSpy).not.toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });
});
