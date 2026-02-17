import { generateDefaultFieldUniversalIdentifier } from '@/cli/utilities/build/manifest/utils/generate-default-field-universal-identifier';
import { type ObjectConfig } from '@/sdk/objects/object-config';

describe('generateDefaultFieldUniversalIdentifier', () => {
  it('should generate a unique universal identifier', () => {
    const objectConfig = {
      universalIdentifier: '55b79f88-4094-4b3f-a0ac-1a91a55714f2',
    } as ObjectConfig;

    const uId1 = generateDefaultFieldUniversalIdentifier({
      objectConfig,
      fieldName: 'id',
    });
    const uId2 = generateDefaultFieldUniversalIdentifier({
      objectConfig,
      fieldName: 'id',
    });

    const anotherUId = generateDefaultFieldUniversalIdentifier({
      objectConfig,
      fieldName: 'name',
    });

    expect(uId1).toEqual(uId2);
    expect(uId1).not.toEqual(anotherUId);
  });
});
