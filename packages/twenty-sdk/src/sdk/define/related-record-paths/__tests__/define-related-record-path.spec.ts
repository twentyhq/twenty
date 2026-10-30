import { describe, expect, it } from 'vitest';

import { defineRelatedRecordPath } from '@/sdk/define';

const baseValidConfig = {
  universalIdentifier: '0b6c4f7e-3d5a-4a8e-9a0d-6f1e2c3b4a01',
  objectUniversalIdentifier: '0b6c4f7e-3d5a-4a8e-9a0d-6f1e2c3b4a02',
  firstFieldMetadataUniversalIdentifier: '0b6c4f7e-3d5a-4a8e-9a0d-6f1e2c3b4a03',
};

describe('defineRelatedRecordPath', () => {
  it('returns success for a valid config', () => {
    const result = defineRelatedRecordPath({
      ...baseValidConfig,
      secondFieldMetadataUniversalIdentifier:
        '0b6c4f7e-3d5a-4a8e-9a0d-6f1e2c3b4a04',
      isInherent: true,
    });

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects a path without a first field', () => {
    const result = defineRelatedRecordPath({
      ...baseValidConfig,
      firstFieldMetadataUniversalIdentifier: '',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a path that skips its second relation', () => {
    const result = defineRelatedRecordPath({
      ...baseValidConfig,
      thirdFieldMetadataUniversalIdentifier:
        '0b6c4f7e-3d5a-4a8e-9a0d-6f1e2c3b4a05',
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Related record path cannot skip its second relation',
    );
  });
});
