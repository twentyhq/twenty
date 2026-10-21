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
        { key: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED, value: true },
        { key: FeatureFlagKey.IS_ASYNC_CSV_EXPORT_ENABLED, value: false },
      ]),
    ).toEqual({
      IS_AI_CHAT_INBOX_ENABLED: true,
      IS_ASYNC_CSV_EXPORT_ENABLED: false,
    });
  });
});
