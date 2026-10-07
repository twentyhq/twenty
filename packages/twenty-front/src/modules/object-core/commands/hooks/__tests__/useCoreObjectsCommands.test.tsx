import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { messages } from '~/locales/generated/en';
import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { useCoreObjectsCommands } from '@/object-core/commands/hooks/useCoreObjectsCommands';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const mockIsCoreEnabled = jest.fn();

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => mockIsCoreEnabled(),
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <I18nProvider i18n={i18n}>
      <MemoryRouter initialEntries={['/command-menu']}>
        <CommandMenuContext.Provider
          value={{
            displayType: 'listItem',
            containerType: CommandMenuItemContainerType.CommandMenuList,
            isInPreviewMode: false,
            commandMenuItems: [],
            commandMenuContextApi: {
              ...EMPTY_COMMAND_MENU_CONTEXT_API,
              objectMetadataItem: {
                nameSingular: CoreObjectNameSingular.Workflow,
              },
            },
          }}
        >
          {children}
        </CommandMenuContext.Provider>
      </MemoryRouter>
    </I18nProvider>
  </JotaiProvider>
);

const renderCommands = () =>
  renderHook(useCoreObjectsCommands, { wrapper: Wrapper });

describe('useCoreObjectsCommands', () => {
  beforeEach(() => {
    mockIsCoreEnabled.mockReturnValue(true);
  });

  it('exposes the workflow filters command on the core workflows index', () => {
    const { result } = renderCommands();
    expect(result.current.shouldDisplayCoreWorkflowFiltersCommand).toBe(true);
    expect(result.current.coreObjectCommandIds).toHaveLength(1);
  });

  it('keeps core commands hidden with the flag off', () => {
    mockIsCoreEnabled.mockReturnValue(false);
    const { result } = renderCommands();
    expect(result.current.shouldDisplayCoreWorkflowFiltersCommand).toBe(false);
    expect(result.current.coreObjectCommandIds).toEqual([]);
  });
});
