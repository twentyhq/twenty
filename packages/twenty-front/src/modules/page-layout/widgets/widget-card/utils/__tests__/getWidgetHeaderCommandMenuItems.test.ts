import { getWidgetHeaderCommandMenuItems } from '@/page-layout/widgets/widget-card/utils/getWidgetHeaderCommandMenuItems';

const makeCommandMenuItem = ({
  id,
  universalIdentifier,
  applicationId = 'application-id',
}: {
  id: string;
  universalIdentifier: string | null;
  applicationId?: string;
}) => ({
  id,
  universalIdentifier,
  applicationId,
});

describe('getWidgetHeaderCommandMenuItems', () => {
  it('resolves command menu items in declaration order', () => {
    const firstCommandMenuItem = makeCommandMenuItem({
      id: 'first-command-menu-item-id',
      universalIdentifier: 'first-command-menu-item-universal-identifier',
    });
    const secondCommandMenuItem = makeCommandMenuItem({
      id: 'second-command-menu-item-id',
      universalIdentifier: 'second-command-menu-item-universal-identifier',
    });

    expect(
      getWidgetHeaderCommandMenuItems({
        commandMenuItems: [firstCommandMenuItem, secondCommandMenuItem],
        commandMenuItemUniversalIdentifiers: [
          'second-command-menu-item-universal-identifier',
          'first-command-menu-item-universal-identifier',
        ],
        applicationId: 'application-id',
      }),
    ).toEqual([secondCommandMenuItem, firstCommandMenuItem]);
  });

  it('ignores missing, duplicate, and cross-application references', () => {
    const commandMenuItem = makeCommandMenuItem({
      id: 'command-menu-item-id',
      universalIdentifier: 'command-menu-item-universal-identifier',
    });
    const crossApplicationCommandMenuItem = makeCommandMenuItem({
      id: 'cross-application-command-menu-item-id',
      universalIdentifier:
        'cross-application-command-menu-item-universal-identifier',
      applicationId: 'another-application-id',
    });

    expect(
      getWidgetHeaderCommandMenuItems({
        commandMenuItems: [commandMenuItem, crossApplicationCommandMenuItem],
        commandMenuItemUniversalIdentifiers: [
          'missing-command-menu-item-universal-identifier',
          'command-menu-item-universal-identifier',
          'command-menu-item-universal-identifier',
          'cross-application-command-menu-item-universal-identifier',
        ],
        applicationId: 'application-id',
      }),
    ).toEqual([commandMenuItem]);
  });
});
