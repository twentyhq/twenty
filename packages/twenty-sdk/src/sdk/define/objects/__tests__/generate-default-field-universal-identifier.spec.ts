import { generateDefaultFieldUniversalIdentifier } from '@/sdk/define/objects/generate-default-field-universal-identifier';

import { getFieldUniversalIdentifier } from 'twenty-shared/application';

describe('generateDefaultFieldUniversalIdentifier', () => {
  const applicationUniversalIdentifier =
    'c6061e2c-7b5c-4a63-b6a4-6f2ef2f2fefb';
  const objectUniversalIdentifier = '55b79f88-4094-4b3f-a0ac-1a91a55714f2';

  it('should generate a unique universal identifier', () => {
    const uId1 = generateDefaultFieldUniversalIdentifier({
      applicationUniversalIdentifier,
      objectUniversalIdentifier,
      fieldName: 'id',
    });
    const uId2 = generateDefaultFieldUniversalIdentifier({
      applicationUniversalIdentifier,
      objectUniversalIdentifier,
      fieldName: 'id',
    });

    const anotherUId = generateDefaultFieldUniversalIdentifier({
      applicationUniversalIdentifier,
      objectUniversalIdentifier,
      fieldName: 'name',
    });

    expect(uId1).toEqual(uId2);
    expect(uId1).not.toEqual(anotherUId);
  });

  it('should match the shared getFieldUniversalIdentifier derivation', () => {
    const universalIdentifier = generateDefaultFieldUniversalIdentifier({
      applicationUniversalIdentifier,
      objectUniversalIdentifier,
      fieldName: 'createdAt',
    });

    expect(universalIdentifier).toEqual(
      getFieldUniversalIdentifier({
        applicationUniversalIdentifier,
        objectUniversalIdentifier,
        name: 'createdAt',
      }),
    );
  });

  it('should generate different identifiers for different applications', () => {
    const otherApplicationUId = generateDefaultFieldUniversalIdentifier({
      applicationUniversalIdentifier: '0b04e15c-27b2-4741-9046-b32e07469072',
      objectUniversalIdentifier,
      fieldName: 'id',
    });

    expect(otherApplicationUId).not.toEqual(
      generateDefaultFieldUniversalIdentifier({
        applicationUniversalIdentifier,
        objectUniversalIdentifier,
        fieldName: 'id',
      }),
    );
  });
});
