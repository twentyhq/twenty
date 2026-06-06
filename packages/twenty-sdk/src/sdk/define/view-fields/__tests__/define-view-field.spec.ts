import { defineViewField } from '@/sdk/define';
import { type StandaloneViewFieldManifest } from 'twenty-shared/application';

const validConfig: StandaloneViewFieldManifest = {
  universalIdentifier: '40b17076-ea50-4e42-968e-8989a95f2b5d',
  viewUniversalIdentifier: '20202020-a002-4a02-8a02-ae0a1ea11a00',
  fieldMetadataUniversalIdentifier: '4e0fd7ff-0bbc-47b2-baab-5fe2c0d12557',
  position: 10,
  isVisible: true,
};

describe('defineViewField', () => {
  it('should return successful validation result for a complete config', () => {
    const result = defineViewField(validConfig);

    expect(result.success).toBe(true);
    expect(result.config).toEqual(validConfig);
    expect(result.errors).toEqual([]);
  });

  it('should return error when universalIdentifier is missing', () => {
    const { universalIdentifier: _, ...withoutUniversalIdentifier } =
      validConfig;

    const result = defineViewField(withoutUniversalIdentifier as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'View field must have a universalIdentifier',
    );
  });

  it('should return error when viewUniversalIdentifier is missing', () => {
    const { viewUniversalIdentifier: _, ...withoutViewUniversalIdentifier } =
      validConfig;

    const result = defineViewField(withoutViewUniversalIdentifier as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'View field must have a viewUniversalIdentifier',
    );
  });

  it('should return error when fieldMetadataUniversalIdentifier is missing', () => {
    const { fieldMetadataUniversalIdentifier: _, ...withoutField } =
      validConfig;

    const result = defineViewField(withoutField as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'View field must have a fieldMetadataUniversalIdentifier',
    );
  });
});
