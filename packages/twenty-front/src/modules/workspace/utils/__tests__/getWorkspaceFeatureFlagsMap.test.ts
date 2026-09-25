import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { getWorkspaceFeatureFlagsMap } from '@/workspace/utils/getWorkspaceFeatureFlagsMap';

describe('getWorkspaceFeatureFlagsMap', () => {
  it('should return an empty map without flags', () => {
    expect(getWorkspaceFeatureFlagsMap(null)).toEqual({});
    expect(getWorkspaceFeatureFlagsMap(undefined)).toEqual({});
    expect(getWorkspaceFeatureFlagsMap([])).toEqual({});
  });

  it('should key every flag by name with its value', () => {
    const featureFlags = [
      { key: 'IS_MESSAGES_TAB_ENABLED', value: true, id: 'flag-1' },
      { key: 'IS_RECORD_SHARING_ENABLED', value: false, id: 'flag-2' },
    ] as unknown as CurrentWorkspace['featureFlags'];

    expect(getWorkspaceFeatureFlagsMap(featureFlags)).toEqual({
      IS_MESSAGES_TAB_ENABLED: true,
      IS_RECORD_SHARING_ENABLED: false,
    });
  });
});
