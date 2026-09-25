import { getWorkspaceFeatureFlagsMap } from '@/workspace/utils/getWorkspaceFeatureFlagsMap';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

describe('getWorkspaceFeatureFlagsMap', () => {
  it('should return an empty map without flags', () => {
    expect(getWorkspaceFeatureFlagsMap(null)).toEqual({});
    expect(getWorkspaceFeatureFlagsMap(undefined)).toEqual({});
    expect(getWorkspaceFeatureFlagsMap([])).toEqual({});
  });

  it('should key every flag by name with its value', () => {
    expect(
      getWorkspaceFeatureFlagsMap([
        { key: FeatureFlagKey.IS_MESSAGES_TAB_ENABLED, value: true },
        { key: FeatureFlagKey.IS_RECORD_SHARING_ENABLED, value: false },
      ]),
    ).toEqual({
      IS_MESSAGES_TAB_ENABLED: true,
      IS_RECORD_SHARING_ENABLED: false,
    });
  });
});
