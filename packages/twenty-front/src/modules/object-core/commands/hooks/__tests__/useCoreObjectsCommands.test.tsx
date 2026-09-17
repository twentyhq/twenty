import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { messages } from '~/locales/generated/en';
import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { useCoreObjectsCommands } from '@/object-core/commands/hooks/useCoreObjectsCommands';
import { coreWorkflowsFilterSettingsState } from '@/object-core/workflows/states/coreWorkflowsFilterSettingsState';
import { coreWorkflowsSelectionState } from '@/object-core/workflows/states/coreWorkflowsSelectionState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const mockIsCoreEnabled = jest.fn();
const mockHasPermission = jest.fn();

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => mockIsCoreEnabled(),
}));
jest.mock('@/settings/roles/hooks/useHasPermissionFlag', () => ({
  useHasPermissionFlag: () => mockHasPermission(),
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

const renderCommands = () => {
  const rendered = renderHook(useCoreObjectsCommands, { wrapper: Wrapper });
  act(() =>
    jotaiStore.set(coreWorkflowsSelectionState.atom, {
      filterSettings: jotaiStore.get(coreWorkflowsFilterSettingsState.atom),
      rowIds: ['8c9a3708-5674-4e1b-a9b9-4f0dacb26c15'],
    }),
  );
  return rendered;
};

describe('useCoreObjectsCommands', () => {
  beforeEach(() => {
    mockIsCoreEnabled.mockReturnValue(true);
    mockHasPermission.mockReturnValue(true);
    jotaiStore.set(coreWorkflowsFilterSettingsState.atom, {});
  });

  it('exposes selected workflow commands inside the command-menu route', () => {
    const { result } = renderCommands();
    expect(result.current.shouldDisplayCoreWorkflowsDeleteCommand).toBe(true);
    expect(result.current.shouldDisplayCoreWorkflowFiltersCommand).toBe(true);
  });

  it('does not expose core deletion without the workflow permission', () => {
    mockHasPermission.mockReturnValue(false);
    const { result } = renderCommands();
    expect(result.current.shouldDisplayCoreWorkflowsDeleteCommand).toBe(false);
  });

  it('keeps core commands hidden with the flag off', () => {
    mockIsCoreEnabled.mockReturnValue(false);
    const { result } = renderCommands();
    expect(result.current.coreObjectsCommandIds).toEqual([]);
  });
});
