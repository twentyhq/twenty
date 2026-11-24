import { type CommandMenuItemSectionsToggleState } from '@/command-menu-item/types/CommandMenuItemSectionsToggleState';
import { isCommandMenuItemSectionOpen } from '@/command-menu-item/utils/isCommandMenuItemSectionOpen';
import { toggleCommandMenuItemSection } from '@/command-menu-item/utils/toggleCommandMenuItemSection';

const INITIAL_TOGGLE_STATE: CommandMenuItemSectionsToggleState = {
  openSectionsWhileIdle: [],
  closedSectionsWhileSearching: { search: '', sections: [] },
};

describe('isCommandMenuItemSectionOpen', () => {
  it('always opens a section that cannot collapse', () => {
    expect(
      isCommandMenuItemSectionOpen({
        section: 'WORKSPACE',
        search: '',
        toggleState: INITIAL_TOGGLE_STATE,
      }),
    ).toBe(true);
  });

  it('starts a collapsible section closed while idle and opens it on toggle', () => {
    expect(
      isCommandMenuItemSectionOpen({
        section: 'GO_TO',
        search: '',
        toggleState: INITIAL_TOGGLE_STATE,
      }),
    ).toBe(false);

    const toggleState = toggleCommandMenuItemSection({
      section: 'GO_TO',
      isOpen: true,
      search: '',
      toggleState: INITIAL_TOGGLE_STATE,
    });

    expect(
      isCommandMenuItemSectionOpen({
        section: 'GO_TO',
        search: '',
        toggleState,
      }),
    ).toBe(true);
    expect(
      isCommandMenuItemSectionOpen({
        section: 'CREATE_RECORD',
        search: '',
        toggleState,
      }),
    ).toBe(false);
  });

  it('opens a collapsible section while searching until the user closes it', () => {
    expect(
      isCommandMenuItemSectionOpen({
        section: 'GO_TO',
        search: 'peo',
        toggleState: INITIAL_TOGGLE_STATE,
      }),
    ).toBe(true);

    const toggleState = toggleCommandMenuItemSection({
      section: 'GO_TO',
      isOpen: false,
      search: 'peo ',
      toggleState: INITIAL_TOGGLE_STATE,
    });

    expect(
      isCommandMenuItemSectionOpen({
        section: 'GO_TO',
        search: 'peo',
        toggleState,
      }),
    ).toBe(false);
  });

  it('forgets a section closed while searching once the search changes', () => {
    const toggleState = toggleCommandMenuItemSection({
      section: 'GO_TO',
      isOpen: false,
      search: 'peo',
      toggleState: INITIAL_TOGGLE_STATE,
    });

    expect(
      isCommandMenuItemSectionOpen({
        section: 'GO_TO',
        search: 'peop',
        toggleState,
      }),
    ).toBe(true);
  });

  it('keeps the idle choice apart from the search one', () => {
    const toggleState = toggleCommandMenuItemSection({
      section: 'GO_TO',
      isOpen: false,
      search: 'peo',
      toggleState: INITIAL_TOGGLE_STATE,
    });

    expect(
      isCommandMenuItemSectionOpen({
        section: 'GO_TO',
        search: '',
        toggleState,
      }),
    ).toBe(false);
  });
});
