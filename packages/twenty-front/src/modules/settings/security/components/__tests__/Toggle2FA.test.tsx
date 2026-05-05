import { render } from '@testing-library/react';

import { Toggle2FA } from '@/settings/security/components/Toggle2FA';

jest.mock('@/auth/hooks/useIsSsoEnabled', () => ({
  useIsSsoEnabled: jest.fn(),
}));

const useIsSsoEnabledMock: jest.Mock = jest.requireMock(
  '@/auth/hooks/useIsSsoEnabled',
).useIsSsoEnabled;

describe('Toggle2FA', () => {
  // Under SSO the IdP owns MFA — the outer component returns null before
  // any inner hook (useSnackBar, useAtomState, useMutation) runs. The
  // SSO-off path defers to <Toggle2FAEnabled /> which depends on contexts
  // we don't own — out of scope for this test file.
  it('returns null when SSO is enabled', () => {
    useIsSsoEnabledMock.mockReturnValue(true);

    const { container } = render(<Toggle2FA />);

    expect(container.firstChild).toBeNull();
    expect(useIsSsoEnabledMock).toHaveBeenCalled();
  });
});
