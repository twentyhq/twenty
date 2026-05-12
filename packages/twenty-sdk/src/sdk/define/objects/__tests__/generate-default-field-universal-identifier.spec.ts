import { generateDefaultFieldUniversalIdentifier } from '@/sdk/define/objects/generate-default-field-universal-identifier';

describe('generateDefaultFieldUniversalIdentifier', () => {
  it('should generate a unique universal identifier', () => {
    const objectUniversalIdentifier = '55b79f88-4094-4b3f-a0ac-1a91a55714f2';

    const uId1 = generateDefaultFieldUniversalIdentifier({
      objectUniversalIdentifier,
      fieldName: 'id',
    });
    const uId2 = generateDefaultFieldUniversalIdentifier({
      objectUniversalIdentifier,
      fieldName: 'id',
    });

    const anotherUId = generateDefaultFieldUniversalIdentifier({
      objectUniversalIdentifier,
      fieldName: 'name',
    });

    expect(uId1).toEqual(uId2);
    expect(uId1).not.toEqual(anotherUId);
  });
});
