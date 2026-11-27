import { getNavigationMenuSectionNavigationSectionId } from '@/navigation-menu-item/display/utils/getNavigationMenuSectionNavigationSectionId';

describe('getNavigationMenuSectionNavigationSectionId', () => {
  it('uses the section id for custom sections', () => {
    expect(
      getNavigationMenuSectionNavigationSectionId({ id: 'sales-section-id' }),
    ).toBe('navigation-menu-section-sales-section-id');
  });

  it('uses the shared collapse id for built-in sections', () => {
    expect(
      getNavigationMenuSectionNavigationSectionId({
        id: 'agents-section-id',
        builtInSectionKey: 'aiAgents',
      }),
    ).toBe('AiAgents');
    expect(
      getNavigationMenuSectionNavigationSectionId({
        id: 'triage-section-id',
        builtInSectionKey: 'aiChatInbox',
      }),
    ).toBe('AiChatTriage');
  });

  it('falls back to the section id without a built-in key', () => {
    expect(
      getNavigationMenuSectionNavigationSectionId({
        id: 'legacy-section-id',
        builtInSectionKey: null,
      }),
    ).toBe('navigation-menu-section-legacy-section-id');
  });
});
