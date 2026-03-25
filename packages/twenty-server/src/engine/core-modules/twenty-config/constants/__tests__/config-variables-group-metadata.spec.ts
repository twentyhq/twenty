import { CONFIG_VARIABLES_GROUP_METADATA } from 'src/engine/core-modules/twenty-config/constants/config-variables-group-metadata';
import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';

describe('CONFIG_VARIABLES_GROUP_METADATA', () => {
  it('should include all ConfigVariablesGroup enum values', () => {
    const enumValues = Object.values(ConfigVariablesGroup);
    const metadataKeys = Object.keys(CONFIG_VARIABLES_GROUP_METADATA);

    enumValues.forEach((enumValue) => {
      expect(metadataKeys).toContain(enumValue);
    });

    metadataKeys.forEach((key) => {
      expect(enumValues).toContain(key);
    });

    expect(enumValues.length).toBe(metadataKeys.length);
  });

  it('should have unique position values', () => {
    const positions = Object.values(CONFIG_VARIABLES_GROUP_METADATA).map(
      (metadata) => metadata.position,
    );
    const uniquePositions = new Set(positions);

    expect(positions.length).toBe(uniquePositions.size);
  });
});
