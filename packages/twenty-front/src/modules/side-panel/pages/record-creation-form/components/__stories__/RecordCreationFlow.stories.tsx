import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import { CommandRunner } from '@/command-menu-item/engine-command/components/CommandRunner';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { mockedCommandMenuItems } from '~/testing/mock-data/generated/metadata/command-menu-items/mock-command-menu-items-data';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { WorkspaceRouteObjectsContext } from '@/app/routing/components/WorkspaceRouteObjectsProvider';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useCreateNewRecord } from '@/object-record/hooks/useCreateNewRecord';
import { RecordCreationFormProvider } from '@/object-record/record-form/components/RecordCreationFormProvider';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { SidePanelRecordCreationFormPage } from '@/side-panel/pages/record-creation-form/components/SidePanelRecordCreationFormPage';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useStore } from 'jotai';
import { graphql, HttpResponse } from 'msw';
import { useContext, useEffect, useState } from 'react';
import {
  expect,
  fireEvent,
  fn,
  userEvent,
  waitFor,
  within,
} from 'storybook/test';
import { AppPath, OpenRecordIn, SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { getOsControlSymbol } from 'twenty-ui/utilities';
import {
  EngineComponentKey,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { ToastStoryContainer } from '~/testing/components/ToastStoryContainer';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedCompanyRecords } from '~/testing/mock-data/generated/data/companies/mock-companies-data';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const createCompanyRequest = fn();
const onRecordCreated = fn();
const LAYOUT_ID = 'record-creation-story-layout';
const TAB_ID = 'record-creation-story-tab';

type RecordCreationFlowProps = {
  commandOrigin?: 'task' | 'no-object';
};

const RecordCreationFlow = ({ commandOrigin }: RecordCreationFlowProps) => {
  const store = useStore();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: 'company',
  });
  const { replaceDraft, applyChanges } = useUpdateMetadataStoreDraft();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const nameField = objectMetadataItem.fields.find(
      (field) => field.name === 'name',
    );
    if (!isDefined(nameField)) {
      throw new Error('Company name field is required for the creation story');
    }
    const metadata = {
      applicationId: '',
      isSystemSideEffect: false,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      deletedAt: null,
    };
    replaceDraft('pageLayouts', [
      {
        ...metadata,
        id: LAYOUT_ID,
        universalIdentifier: LAYOUT_ID,
        name: 'Company creation',
        type: PageLayoutType.RECORD_FORM,
        objectMetadataId: objectMetadataItem.id,
        isFirstTabPinned: false,
      },
    ]);
    replaceDraft('pageLayoutTabs', [
      {
        ...metadata,
        id: TAB_ID,
        universalIdentifier: TAB_ID,
        pageLayoutId: LAYOUT_ID,
        title: 'Fields',
        isActive: true,
        position: 0,
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      },
    ]);
    replaceDraft('pageLayoutWidgets', [
      {
        ...metadata,
        id: 'company-name-widget',
        universalIdentifier: 'company-name-widget',
        pageLayoutTabId: TAB_ID,
        title: 'Name',
        isActive: true,
        type: WidgetType.FORM_FIELD,
        objectMetadataId: objectMetadataItem.id,
        configuration: {
          configurationType: WidgetConfigurationType.FORM_FIELD,
          fieldMetadataId: nameField.id,
        },
      },
    ]);
    if (isDefined(commandOrigin)) {
      const template = mockedCommandMenuItems.find(
        (item) =>
          item.engineComponentKey === EngineComponentKey.CREATE_NEW_RECORD &&
          !isDefined(item.availabilityObjectMetadataId),
      );
      if (!isDefined(template)) {
        throw new Error('Creation command template is required');
      }
      replaceDraft('commandMenuItems', [template]);
      store.set(
        contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
          instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
        commandOrigin === 'task'
          ? getMockObjectMetadataItemOrThrow('task').id
          : undefined,
      );
      store.set(
        contextStoreCurrentViewIdComponentState.atomFamily({
          instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
        undefined,
      );
    }
    applyChanges();
    store.set(currentWorkspaceState.atom, mockCurrentWorkspace);
    store.set(currentWorkspaceMemberState.atom, (member) =>
      isDefined(member)
        ? { ...member, openRecordIn: OpenRecordIn.SIDE_PANEL }
        : member,
    );
    setIsReady(true);
  }, [applyChanges, commandOrigin, objectMetadataItem, replaceDraft, store]);

  return isReady ? (
    <WorkspaceRouteObjectsContext.Provider
      value={[
        {
          path: AppPath.RecordShowPage,
          handle: { workspaceSurfaces: ['main', 'side-panel'] },
        },
      ]}
    >
      <RecordCreationFormProvider>
        <ContextStoreComponentInstanceContext.Provider
          value={{ instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID }}
        >
          <RecordCreationFlowContent commandOrigin={commandOrigin} />
          <CommandRunner />
        </ContextStoreComponentInstanceContext.Provider>
      </RecordCreationFormProvider>
    </WorkspaceRouteObjectsContext.Provider>
  ) : null;
};

const CreationCommandMenu = () => {
  const { commandMenuItems } = useContext(CommandMenuContext);
  return (
    <SelectableList
      selectableListInstanceId="creation-story-menu"
      focusId="creation-story-menu"
      selectableItemIdArray={commandMenuItems.map((item) => item.id)}
    >
      {commandMenuItems.map((item) => (
        <CommandMenuItemRenderer key={item.id} item={item} />
      ))}
    </SelectableList>
  );
};

const RecordCreationFlowContent = ({
  commandOrigin,
}: Pick<RecordCreationFlowProps, 'commandOrigin'>) => {
  const store = useStore();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: 'company',
  });
  const { createNewRecord } = useCreateNewRecord({
    objectMetadataItem,
    buildRecordInput: () => ({ name: 'Filter default', employees: 10 }),
    onRecordCreated,
  });
  const { goBackFromSidePanel } = useSidePanelHistory();
  const stack = useAtomStateValue(sidePanelNavigationStackState);
  const isOpened = useAtomStateValue(isSidePanelOpenedState);
  const currentPage = stack.at(-1);
  const [result, setResult] = useState<ObjectRecord | null>();

  const handleCreate = async () => {
    setResult((await createNewRecord({ position: 'first' })) ?? null);
  };

  return (
    <>
      {isDefined(commandOrigin) ? (
        <CommandMenuContextProvider
          displayType="listItem"
          containerType={CommandMenuItemContainerType.CommandMenuList}
        >
          <CommandMenuComponentInstanceContext.Provider
            value={{ instanceId: 'creation-story-menu' }}
          >
            <CreationCommandMenu />
          </CommandMenuComponentInstanceContext.Provider>
        </CommandMenuContextProvider>
      ) : (
        <Button title="Create company" onClick={handleCreate} />
      )}
      {isDefined(commandOrigin) && (
        <p role="status">Opened: {currentPage?.routedLocation?.pathname}</p>
      )}
      {isOpened && currentPage?.page === SidePanelPages.RecordCreationForm && (
        <SidePanelPageComponentInstanceContext.Provider
          value={{ instanceId: currentPage.pageId }}
        >
          <Button title="Cancel" onClick={goBackFromSidePanel} />
          <SidePanelRecordCreationFormPage />
        </SidePanelPageComponentInstanceContext.Provider>
      )}
      {result === null && <p>Creation cancelled</p>}
      {isDefined(result) && (
        <div role="status">
          Created {String(result.name)} with {String(result.employees)}{' '}
          employees
          <p>
            Stored:{' '}
            {String(
              store.get(recordStoreFamilyState.atomFamily(result.id))?.name,
            )}
          </p>
          <p>Opened: {currentPage?.routedLocation?.pathname}</p>
        </div>
      )}
    </>
  );
};

const meta = {
  title: 'Modules/SidePanel/RecordCreationFlow',
  component: RecordCreationFlow,
  decorators: [
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    RouterDecorator,
    ComponentDecorator,
  ],
  parameters: {
    container: { width: 420, height: 600 },
    msw: {
      handlers: [
        graphql.mutation('CreateOneCompany', ({ variables }) => {
          createCompanyRequest(variables.input);
          return HttpResponse.json({
            data: {
              createCompany: {
                ...mockedCompanyRecords[0],
                ...variables.input,
                createdBy: {
                  ...mockedCompanyRecords[0].createdBy,
                  provider: null,
                },
                updatedBy: {
                  ...mockedCompanyRecords[0].updatedBy,
                  provider: null,
                },
              },
            },
          });
        }),
        ...graphqlMocks.handlers,
      ],
    },
  },
  beforeEach: () => {
    createCompanyRequest.mockClear();
    onRecordCreated.mockClear();
  },
} satisfies Meta<typeof RecordCreationFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

const submitCompany = async (canvasElement: HTMLElement, shortcut?: string) => {
  const canvas = within(canvasElement);
  await userEvent.click(
    await canvas.findByRole('button', { name: /Create company/ }),
  );
  const nameInput = await canvas.findByRole('textbox');
  await expect(nameInput).toHaveTextContent('Filter default');
  await userEvent.click(nameInput);
  await userEvent.clear(nameInput);
  await userEvent.type(nameInput, 'Acme');
  const createButton = canvas.getByTestId('record-creation-form-create-button');
  await expect(createButton).toHaveTextContent(getOsControlSymbol());
  await expect(createButton).toHaveTextContent('⏎');
  if (isDefined(shortcut)) {
    await expect(nameInput).toHaveFocus();
    await userEvent.keyboard(shortcut);
  } else {
    await userEvent.click(createButton);
  }
  await expect(await canvas.findByRole('status')).toHaveTextContent(
    'Created Acme with 10 employees',
  );
  await expect(canvas.getByRole('status')).toHaveTextContent('Stored: Acme');
  await expect(canvas.getByRole('status')).toHaveTextContent(
    'Opened: /object/company/',
  );
  await expect(createCompanyRequest).toHaveBeenCalledTimes(1);
  await expect(createCompanyRequest).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'Acme', employees: 10, position: 'first' }),
  );
  await expect(onRecordCreated).toHaveBeenCalledTimes(1);
  await expect(onRecordCreated).toHaveBeenCalledWith({
    record: expect.objectContaining({ name: 'Acme', employees: 10 }),
    recordInput: expect.objectContaining({ name: 'Acme', position: 'first' }),
  });
};

export const SubmitWithButton: Story = {
  play: ({ canvasElement }) => submitCompany(canvasElement),
};

const REJECTED_COMPANY_NAME = 'Taken name';

export const RetryAfterFailedCreation: Story = {
  decorators: [
    (Story) => (
      <ToastStoryContainer>
        <Story />
      </ToastStoryContainer>
    ),
  ],
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('CreateOneCompany', ({ variables }) => {
          if (variables.input.name !== REJECTED_COMPANY_NAME) {
            return;
          }
          createCompanyRequest(variables.input);
          return HttpResponse.json({
            errors: [
              {
                message: 'Duplicate company name',
                extensions: {
                  userFriendlyMessage: 'This company name is already taken',
                },
              },
            ],
          });
        }),
        ...meta.parameters.msw.handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole('button', { name: /Create company/ }),
    );
    const nameInput = await canvas.findByRole('textbox');
    await userEvent.click(nameInput);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, REJECTED_COMPANY_NAME);
    const createButton = canvas.getByTestId(
      'record-creation-form-create-button',
    );
    await userEvent.click(createButton);

    await expect(
      await canvas.findByText('This company name is already taken'),
    ).toBeVisible();
    await waitFor(() => expect(createButton).toBeEnabled());
    await expect(nameInput).toHaveTextContent(REJECTED_COMPANY_NAME);
    await expect(onRecordCreated).not.toHaveBeenCalled();

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Acme');
    await userEvent.click(createButton);

    await expect(
      await canvas.findByText('Created Acme with 10 employees'),
    ).toBeVisible();
    await expect(createCompanyRequest).toHaveBeenCalledTimes(2);
    await expect(onRecordCreated).toHaveBeenCalledTimes(1);
  },
};

export const Cancel: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole('button', { name: /Create company/ }),
    );
    await userEvent.click(
      await canvas.findByRole('button', { name: /Cancel/ }),
    );
    await expect(await canvas.findByText('Creation cancelled')).toBeVisible();
    await expect(createCompanyRequest).not.toHaveBeenCalled();
    await expect(onRecordCreated).not.toHaveBeenCalled();
  },
};

const createCompanyFromCommandMenu = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  await userEvent.click(await canvas.findByText('Create Company'));
  const input = await canvas.findByRole('textbox');
  await userEvent.type(input, 'Cross-object company');
  await userEvent.click(
    canvas.getByTestId('record-creation-form-create-button'),
  );
  await waitFor(() => expect(createCompanyRequest).toHaveBeenCalledTimes(1));
  await expect(createCompanyRequest).toHaveBeenCalledWith(
    expect.objectContaining({
      name: 'Cross-object company',
      position: 'first',
    }),
  );
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent('/object/company/'),
  );
};

export const CreateCompanyFromTaskPage: Story = {
  args: { commandOrigin: 'task' },
  play: ({ canvasElement }) => createCompanyFromCommandMenu(canvasElement),
};

export const CreateCompanyWithoutObjectContext: Story = {
  args: { commandOrigin: 'no-object' },
  play: ({ canvasElement }) => createCompanyFromCommandMenu(canvasElement),
};

export const SubmitWithCommandEnter: Story = {
  play: ({ canvasElement }) =>
    submitCompany(canvasElement, '{Meta>}{Enter}{/Meta}'),
};
export const SubmitWithControlEnter: Story = {
  play: ({ canvasElement }) =>
    submitCompany(canvasElement, '{Control>}{Enter}{/Control}'),
};

export const IgnoreNonSubmitKeys: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole('button', { name: /Create company/ }),
    );
    const input = await canvas.findByRole('textbox');
    await userEvent.click(input);
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{Meta>}{Shift>}{Enter}{/Shift}{/Meta}');
    await userEvent.keyboard('{Control>}{Alt>}{Enter}{/Alt}{/Control}');
    fireEvent.keyDown(input, {
      key: 'Enter',
      code: 'Enter',
      metaKey: true,
      isComposing: true,
    });
    fireEvent.keyDown(input, {
      key: 'Enter',
      code: 'Enter',
      ctrlKey: true,
      keyCode: 229,
    });
    await expect(
      canvas.getByTestId('record-creation-form-create-button'),
    ).toBeVisible();
    await expect(createCompanyRequest).not.toHaveBeenCalled();
  },
};
