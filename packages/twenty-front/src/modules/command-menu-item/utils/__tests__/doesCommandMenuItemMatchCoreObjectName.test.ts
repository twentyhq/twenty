import { doesCommandMenuItemMatchCoreObjectName } from '@/command-menu-item/utils/doesCommandMenuItemMatchCoreObjectName';

describe('doesCommandMenuItemMatchCoreObjectName', () => {
  it('shows core workflow commands only on core workflow pages', () => {
    const activateWorkflow = { availabilityCoreObjectName: 'workflow' };

    expect(
      doesCommandMenuItemMatchCoreObjectName('workflow')(activateWorkflow),
    ).toBe(true);
    expect(doesCommandMenuItemMatchCoreObjectName(null)(activateWorkflow)).toBe(
      false,
    );
  });

  it('shows commands without a core object everywhere', () => {
    const companyCommand = { availabilityCoreObjectName: null };

    expect(
      doesCommandMenuItemMatchCoreObjectName('workflow')(companyCommand),
    ).toBe(true);
    expect(doesCommandMenuItemMatchCoreObjectName(null)(companyCommand)).toBe(
      true,
    );
  });
});
