import { type CommandMenuCollapsibleSectionNavigation } from '@/command-menu-item/types/CommandMenuCollapsibleSectionNavigation';
import { getCommandMenuSectionKeyboardAction } from '@/command-menu-item/utils/getCommandMenuSectionKeyboardAction';

const buildSections = (
  isGoToOpen: boolean,
): CommandMenuCollapsibleSectionNavigation[] => [
  {
    section: 'GO_TO',
    headerItemId: 'go-to-header',
    isOpen: isGoToOpen,
    itemIds: isGoToOpen ? ['go-to-people'] : [],
  },
];

describe('getCommandMenuSectionKeyboardAction', () => {
  it('opens a closed section from its header with Right', () => {
    expect(
      getCommandMenuSectionKeyboardAction({
        key: 'ArrowRight',
        selectedItemId: 'go-to-header',
        collapsibleSections: buildSections(false),
      }),
    ).toEqual({ section: 'GO_TO', isOpen: true });
  });

  it('closes an open section from its header with Left', () => {
    expect(
      getCommandMenuSectionKeyboardAction({
        key: 'ArrowLeft',
        selectedItemId: 'go-to-header',
        collapsibleSections: buildSections(true),
      }),
    ).toEqual({ section: 'GO_TO', isOpen: false });
  });

  it('does nothing when the header is already in the requested state', () => {
    expect(
      getCommandMenuSectionKeyboardAction({
        key: 'ArrowRight',
        selectedItemId: 'go-to-header',
        collapsibleSections: buildSections(true),
      }),
    ).toBeNull();
  });

  it('closes the section of a row with Left and moves to its header', () => {
    expect(
      getCommandMenuSectionKeyboardAction({
        key: 'ArrowLeft',
        selectedItemId: 'go-to-people',
        collapsibleSections: buildSections(true),
      }),
    ).toEqual({
      section: 'GO_TO',
      isOpen: false,
      itemIdToSelect: 'go-to-header',
    });
  });

  it('ignores Right on a row and keys on rows outside collapsible sections', () => {
    expect(
      getCommandMenuSectionKeyboardAction({
        key: 'ArrowRight',
        selectedItemId: 'go-to-people',
        collapsibleSections: buildSections(true),
      }),
    ).toBeNull();

    expect(
      getCommandMenuSectionKeyboardAction({
        key: 'ArrowLeft',
        selectedItemId: 'copy-link',
        collapsibleSections: buildSections(true),
      }),
    ).toBeNull();
  });
});
