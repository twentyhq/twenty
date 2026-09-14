import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuContextProviderContent } from '@/command-menu-item/contexts/CommandMenuContextProviderContent';
import { commandMenuItemsSelector } from '@/command-menu-item/states/commandMenuItemsSelector';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { mockedCommandMenuItems } from '~/testing/mock-data/generated/metadata/command-menu-items/mock-command-menu-items-data';
import { render, screen } from '@testing-library/react';
import { useContext } from 'react';
import { ContextStorePageType } from 'twenty-shared/types';

const mockUseGlobalRecordCreationCommandMenuItems = jest.fn();

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: (state: unknown) =>
    state === commandMenuItemsSelector ? mockedCommandMenuItems : null,
}));
jest.mock(
  '@/layout-customization/hooks/useIsLayoutCustomizationAllowedOnCurrentPage',
  () => ({
    useIsLayoutCustomizationAllowedOnCurrentPage: () => false,
  }),
);
jest.mock(
  '@/command-menu-item/hooks/useGlobalRecordCreationCommandMenuItems',
  () => ({
    useGlobalRecordCreationCommandMenuItems: () =>
      mockUseGlobalRecordCreationCommandMenuItems(),
  }),
);

beforeEach(() => {
  mockUseGlobalRecordCreationCommandMenuItems.mockReturnValue({
    isRecordCreationFormEnabled: true,
    globalRecordCreationCommandMenuItems: [
      { id: 'create-company', label: 'Create Company', position: 3 },
      { id: 'create-task', label: 'Create Task', position: 3 },
    ],
  });
});

const CommandLabels = () => {
  const { commandMenuItems } = useContext(CommandMenuContext);

  return (
    <>
      {commandMenuItems.map((item) => (
        <div key={item.id}>{item.label}</div>
      ))}
    </>
  );
};

it.each([
  {
    pageType: ContextStorePageType.Index,
    objectMetadataItem: { id: 'task' },
    numberOfSelectedRecords: 0,
  },
  {
    pageType: ContextStorePageType.Record,
    objectMetadataItem: { id: 'company' },
    numberOfSelectedRecords: 1,
  },
  { ...EMPTY_COMMAND_MENU_CONTEXT_API, numberOfSelectedRecords: 0 },
])(
  'shows all creation commands regardless of page or selection: %j',
  (context) => {
    render(
      <CommandMenuContextProviderContent
        displayType="listItem"
        containerType={CommandMenuItemContainerType.CommandMenuList}
        commandMenuContextApi={{
          ...EMPTY_COMMAND_MENU_CONTEXT_API,
          ...context,
        }}
        isInPreviewMode={false}
      >
        <CommandLabels />
      </CommandMenuContextProviderContent>,
    );

    expect(screen.getByText('Create Company')).toBeInTheDocument();
    expect(screen.getByText('Create Task')).toBeInTheDocument();
  },
);

it.each([true, false])(
  'only allows the legacy command when the form flag is disabled (enabled: %s)',
  (isRecordCreationFormEnabled) => {
    mockUseGlobalRecordCreationCommandMenuItems.mockReturnValue({
      isRecordCreationFormEnabled,
      globalRecordCreationCommandMenuItems: [],
    });
    render(
      <CommandMenuContextProviderContent
        displayType="listItem"
        containerType={CommandMenuItemContainerType.CommandMenuList}
        commandMenuContextApi={{
          ...EMPTY_COMMAND_MENU_CONTEXT_API,
          pageType: ContextStorePageType.Index,
          objectMetadataItem: {
            id: 'company',
            isUICreatable: true,
            isUIEditable: true,
            isRemote: false,
          },
          objectPermissions: {
            ...EMPTY_COMMAND_MENU_CONTEXT_API.objectPermissions,
            canUpdateObjectRecords: true,
          },
        }}
        isInPreviewMode={false}
      >
        <CommandLabels />
      </CommandMenuContextProviderContent>,
    );

    if (isRecordCreationFormEnabled) {
      expect(
        screen.queryByText('Create new {objectLabelSingular}'),
      ).not.toBeInTheDocument();
    } else {
      expect(
        screen.getByText('Create new {objectLabelSingular}'),
      ).toBeInTheDocument();
    }
  },
);
