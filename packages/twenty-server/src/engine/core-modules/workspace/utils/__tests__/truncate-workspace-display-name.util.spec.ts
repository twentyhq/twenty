import { WORKSPACE_DISPLAY_NAME_MAX_LENGTH } from 'twenty-shared/constants';

import { truncateWorkspaceDisplayName } from 'src/engine/core-modules/workspace/utils/truncate-workspace-display-name.util';

describe('truncateWorkspaceDisplayName', () => {
  it('should keep a name within the limit', () => {
    expect(truncateWorkspaceDisplayName('Acme')).toBe('Acme');
  });

  it('should cut a name over the limit', () => {
    expect(
      truncateWorkspaceDisplayName(
        'a'.repeat(WORKSPACE_DISPLAY_NAME_MAX_LENGTH + 1),
      ),
    ).toBe('a'.repeat(WORKSPACE_DISPLAY_NAME_MAX_LENGTH));
  });

  it('should leave a missing name undefined', () => {
    expect(truncateWorkspaceDisplayName(undefined)).toBeUndefined();
  });
});
