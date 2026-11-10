import { NavigationMenuItemType } from 'twenty-shared/types';

import { buildCreateNavigationMenuItemInput } from '@/navigation-menu-item/common/utils/buildCreateNavigationMenuItemInput';

describe('buildCreateNavigationMenuItemInput', () => {
  it('preserves standalone page identity and presentation when saving into a folder', () => {
    const input = buildCreateNavigationMenuItemInput(
      {
        id: 'navigation-item',
        type: NavigationMenuItemType.PAGE_LAYOUT,
        pageLayoutId: 'standalone-page',
        name: 'Team overview',
        icon: 'IconPerspective',
        color: 'blue',
        folderId: 'draft-folder',
        position: 0,
        createdAt: '',
        updatedAt: '',
      },
      () => 'saved-folder',
    );

    expect(input).toEqual({
      id: 'navigation-item',
      type: NavigationMenuItemType.PAGE_LAYOUT,
      pageLayoutId: 'standalone-page',
      name: 'Team overview',
      icon: 'IconPerspective',
      color: 'blue',
      folderId: 'saved-folder',
      position: 0,
    });
  });

  it.each([
    ['/workflows', '/workflows'],
    ['twenty.com', 'https://twenty.com'],
  ])('saves the link %s as %s', (link, expectedLink) => {
    const input = buildCreateNavigationMenuItemInput(
      {
        id: 'navigation-item',
        type: NavigationMenuItemType.LINK,
        name: 'Link',
        link,
        position: 0,
        createdAt: '',
        updatedAt: '',
      },
      () => 'saved-folder',
    );

    expect(input.link).toBe(expectedLink);
  });

  it.each([
    [
      'a workflow',
      NavigationMenuItemType.WORKFLOW,
      { workflowId: 'workflow-id', name: 'Lead routing' },
    ],
    [
      'an agent',
      NavigationMenuItemType.AGENT,
      { agentId: 'agent-id', name: 'Helper' },
    ],
  ])('saves %s', (_, type, target) => {
    const input = buildCreateNavigationMenuItemInput(
      {
        id: 'navigation-item',
        type,
        ...target,
        position: 0,
        createdAt: '',
        updatedAt: '',
      },
      () => 'saved-folder',
    );

    expect(input).toEqual({
      id: 'navigation-item',
      type,
      position: 0,
      ...target,
    });
  });
});
