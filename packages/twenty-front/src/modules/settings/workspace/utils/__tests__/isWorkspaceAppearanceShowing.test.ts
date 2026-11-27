import { isWorkspaceAppearanceShowing } from '@/settings/workspace/utils/isWorkspaceAppearanceShowing';

describe('isWorkspaceAppearanceShowing', () => {
  const workspace = { accentColor: 'grass', uiScale: 'Normal' } as const;

  it('is true when every given value is still on the workspace', () => {
    expect(
      isWorkspaceAppearanceShowing({
        workspace,
        appearance: { accentColor: 'grass' },
      }),
    ).toBe(true);
  });

  it('is false once a newer value replaced it', () => {
    expect(
      isWorkspaceAppearanceShowing({
        workspace,
        appearance: { accentColor: 'violet', uiScale: 'Normal' },
      }),
    ).toBe(false);
  });

  it('is false without a workspace', () => {
    expect(
      isWorkspaceAppearanceShowing({
        workspace: null,
        appearance: { uiScale: 'Large' },
      }),
    ).toBe(false);
  });
});
