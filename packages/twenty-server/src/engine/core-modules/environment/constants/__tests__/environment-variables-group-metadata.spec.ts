import { ENVIRONMENT_VARIABLES_GROUP_METADATA } from 'src/engine/core-modules/environment/constants/environment-variables-group-metadata';
import { EnvironmentVariablesGroup } from 'src/engine/core-modules/environment/enums/environment-variables-group.enum';

describe('ENVIRONMENT_VARIABLES_GROUP_METADATA', () => {
  it('should include all EnvironmentVariablesGroup enum values', () => {
    const enumValues = Object.values(EnvironmentVariablesGroup);
    const metadataKeys = Object.keys(ENVIRONMENT_VARIABLES_GROUP_METADATA);

    enumValues.forEach((enumValue) => {
      expect(metadataKeys).toContain(enumValue);
    });

    metadataKeys.forEach((key) => {
      expect(enumValues).toContain(key);
    });

    expect(enumValues.length).toBe(metadataKeys.length);
  });

  it('should have unique position values', () => {
    const positions = Object.values(ENVIRONMENT_VARIABLES_GROUP_METADATA).map(
      (metadata) => metadata.position,
    );
    const uniquePositions = new Set(positions);

    expect(positions.length).toBe(uniquePositions.size);
  });
});
