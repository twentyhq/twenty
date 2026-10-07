import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { SidePanelRecordCreationFormSettingsPage } from '@/side-panel/pages/record-creation-form-settings/components/SidePanelRecordCreationFormSettingsPage';
import { recordCreationFormSettingsObjectMetadataIdComponentState } from '@/side-panel/pages/record-creation-form-settings/states/recordCreationFormSettingsObjectMetadataIdComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { SidePanelPages } from 'twenty-shared/types';
import { IconPlus } from 'twenty-ui/icon';
import {
  FieldMetadataType,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

const PAGE_ID = 'record-creation-form-settings-page';
const CREATION_FORM_PAGE_ID = 'record-creation-form-page';
const OBJECT_METADATA_ID = 'company-object';
const PAGE_LAYOUT_ID = 'company-record-form';
const PAGE_LAYOUT_TAB_ID = 'company-record-form-fields';

const buildTextField = (name: string, label: string) => ({
  id: `field-${name}`,
  name,
  label,
  type: FieldMetadataType.TEXT,
  icon: 'IconAbc',
  isActive: true,
  isSystem: false,
  isUIEditable: true,
  settings: null,
});

const NAME_FIELD = buildTextField('name', 'Name');
const DOMAIN_FIELD = buildTextField('domain', 'Domain');
const NICKNAME_FIELD = buildTextField('nickname', 'Nickname');
const SECRET_FIELD = buildTextField('secret', 'Secret');

const COMPANY_OBJECT = {
  id: OBJECT_METADATA_ID,
  labelSingular: 'Company',
  fields: [NAME_FIELD, DOMAIN_FIELD, NICKNAME_FIELD, SECRET_FIELD],
};

const updatePageLayoutWidgetsIsActive = jest.fn();
const goBackFromSidePanel = jest.fn(() =>
  jotaiStore.set(sidePanelNavigationStackState.atom, (navigationStack) =>
    navigationStack.slice(0, -1),
  ),
);
const getNavigationStackPageIds = () =>
  jotaiStore
    .get(sidePanelNavigationStackState.atom)
    .map((navigationStackItem) => navigationStackItem.pageId);
const removePageFromSidePanelHistory = jest.fn((pageId: string) =>
  jotaiStore.set(sidePanelNavigationStackState.atom, (navigationStack) =>
    navigationStack.filter(
      (navigationStackItem) => navigationStackItem.pageId !== pageId,
    ),
  ),
);

jest.mock('@/object-metadata/hooks/useObjectMetadataItemById', () => ({
  useObjectMetadataItemById: () => ({ objectMetadataItem: COMPANY_OBJECT }),
}));

jest.mock('@/object-record/hooks/useObjectPermissionsForObject', () => ({
  useObjectPermissionsForObject: () => ({
    restrictedFields: {
      'field-secret': { canRead: true, canUpdate: false },
    },
  }),
}));

jest.mock('@/page-layout/hooks/useUpdatePageLayoutWidgetsIsActive', () => ({
  useUpdatePageLayoutWidgetsIsActive: () => ({
    updatePageLayoutWidgetsIsActive,
  }),
}));

jest.mock('@/side-panel/hooks/useSidePanelHistory', () => ({
  useSidePanelHistory: () => ({
    goBackFromSidePanel,
    removePageFromSidePanelHistory,
  }),
}));

const buildFormFieldWidget = (
  fieldMetadataId: string,
  index: number,
  isActive: boolean,
) => ({
  id: `widget-${fieldMetadataId}`,
  pageLayoutTabId: PAGE_LAYOUT_TAB_ID,
  title: '',
  type: WidgetType.FORM_FIELD,
  isActive,
  position: {
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
    index,
  },
  configuration: {
    configurationType: WidgetConfigurationType.FORM_FIELD,
    fieldMetadataId,
  },
});

const seedRecordFormPageLayout = () => {
  jotaiStore.set(metadataStoreState.atomFamily('pageLayouts'), {
    current: [
      {
        id: PAGE_LAYOUT_ID,
        type: PageLayoutType.RECORD_FORM,
        objectMetadataId: OBJECT_METADATA_ID,
        isSystemSideEffect: true,
      },
    ],
    draft: [],
    status: 'up-to-date',
  });
  jotaiStore.set(metadataStoreState.atomFamily('pageLayoutTabs'), {
    current: [
      {
        id: PAGE_LAYOUT_TAB_ID,
        pageLayoutId: PAGE_LAYOUT_ID,
        isActive: true,
        position: 0,
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      },
    ],
    draft: [],
    status: 'up-to-date',
  });
  jotaiStore.set(metadataStoreState.atomFamily('pageLayoutWidgets'), {
    current: [
      buildFormFieldWidget(NAME_FIELD.id, 0, true),
      buildFormFieldWidget(DOMAIN_FIELD.id, 1, true),
      buildFormFieldWidget(NICKNAME_FIELD.id, 2, false),
      buildFormFieldWidget(SECRET_FIELD.id, 3, false),
    ],
    draft: [],
    status: 'up-to-date',
  });
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <I18nProvider i18n={i18n}>
      <SidePanelPageComponentInstanceContext.Provider
        value={{ instanceId: PAGE_ID }}
      >
        <MemoryRouter>{children}</MemoryRouter>
      </SidePanelPageComponentInstanceContext.Provider>
    </I18nProvider>
  </JotaiProvider>
);

const renderPage = () =>
  render(<SidePanelRecordCreationFormSettingsPage />, { wrapper: Wrapper });

describe('SidePanelRecordCreationFormSettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    updatePageLayoutWidgetsIsActive.mockResolvedValue({
      status: 'successful',
    });
    seedRecordFormPageLayout();
    jotaiStore.set(sidePanelNavigationStackState.atom, [
      {
        page: SidePanelPages.RecordCreationForm,
        pageId: CREATION_FORM_PAGE_ID,
        pageTitle: 'Create Company',
        pageIcon: IconPlus,
      },
      {
        page: SidePanelPages.RecordCreationFormSettings,
        pageId: PAGE_ID,
        pageTitle: 'Create Company',
        pageIcon: IconPlus,
      },
    ]);
    jotaiStore.set(
      recordCreationFormSettingsObjectMetadataIdComponentState.atomFamily({
        instanceId: PAGE_ID,
      }),
      OBJECT_METADATA_ID,
    );
  });

  it('lists the form fields in form order with their visibility, whatever the viewer can update', () => {
    renderPage();

    expect(
      screen
        .getAllByRole('button', { name: /^(Hide|Show) / })
        .map((button) => button.getAttribute('aria-label')),
    ).toEqual(['Hide Name', 'Hide Domain', 'Show Nickname', 'Show Secret']);
  });

  it('saves only the fields whose visibility changed, then goes back', async () => {
    const user = userEvent.setup();

    renderPage();

    await user.click(screen.getByRole('button', { name: 'Hide Domain' }));
    await user.click(screen.getByRole('button', { name: 'Show Nickname' }));
    await user.click(screen.getByRole('button', { name: 'Hide Name' }));
    await user.click(screen.getByRole('button', { name: 'Show Name' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(updatePageLayoutWidgetsIsActive).toHaveBeenCalledWith([
      { widgetId: 'widget-field-domain', isActive: false },
      { widgetId: 'widget-field-nickname', isActive: true },
    ]);
    expect(getNavigationStackPageIds()).toEqual([CREATION_FORM_PAGE_ID]);
  });

  it('discards the changes on cancel', async () => {
    const user = userEvent.setup();

    renderPage();

    await user.click(screen.getByRole('button', { name: 'Hide Domain' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(updatePageLayoutWidgetsIsActive).not.toHaveBeenCalled();
    expect(goBackFromSidePanel).toHaveBeenCalled();
  });

  it('does not leave the creation form when cancel is clicked while saving', async () => {
    const user = userEvent.setup();
    let resolveSave: (value: { status: 'successful' }) => void = () => {};

    updatePageLayoutWidgetsIsActive.mockReturnValue(
      new Promise((resolve) => {
        resolveSave = resolve;
      }),
    );

    renderPage();

    await user.click(screen.getByRole('button', { name: 'Hide Domain' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await act(async () => {
      resolveSave({ status: 'successful' });
    });

    expect(goBackFromSidePanel).toHaveBeenCalledTimes(1);
    expect(getNavigationStackPageIds()).toEqual([CREATION_FORM_PAGE_ID]);
  });

  it('stays on the page when saving fails', async () => {
    const user = userEvent.setup();

    updatePageLayoutWidgetsIsActive.mockResolvedValue({ status: 'failed' });

    renderPage();

    await user.click(screen.getByRole('button', { name: 'Hide Domain' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(getNavigationStackPageIds()).toEqual([
      CREATION_FORM_PAGE_ID,
      PAGE_ID,
    ]);
    expect(
      screen.getByRole('button', { name: 'Show Domain' }),
    ).toBeInTheDocument();
  });
});
