import { ENVIRONMENT_VARIABLES_GROUP_POSITION } from 'src/engine/core-modules/environment/constants/environment-variables-group-position';
import { EnvironmentVariablesGroup } from 'src/engine/core-modules/environment/enums/environment-variables-group.enum';

describe('ENVIRONMENT_VARIABLES_GROUP_POSITION', () => {
  it('should include all EnvironmentVariablesGroup enum values', () => {
    const enumValues = Object.values(EnvironmentVariablesGroup);
    const positionKeys = Object.keys(ENVIRONMENT_VARIABLES_GROUP_POSITION);

    enumValues.forEach((enumValue) => {
      expect(positionKeys).toContain(enumValue);
    });

    positionKeys.forEach((key) => {
      expect(enumValues).toContain(key);
    });

    expect(enumValues.length).toBe(positionKeys.length);
  });

  it('should have unique position values', () => {
    const positions = Object.values(ENVIRONMENT_VARIABLES_GROUP_POSITION);
    const uniquePositions = new Set(positions);

    expect(positions.length).toBe(uniquePositions.size);
  });
});
