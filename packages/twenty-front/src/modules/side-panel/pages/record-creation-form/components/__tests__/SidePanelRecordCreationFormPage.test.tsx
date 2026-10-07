import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { type createElement, type Fragment, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { SidePanelRecordCreationFormPage } from '@/side-panel/pages/record-creation-form/components/SidePanelRecordCreationFormPage';
import { recordCreationFormRequestComponentState } from '@/side-panel/pages/record-creation-form/states/recordCreationFormRequestComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { type ValidationRule } from '@/validation-rules/types/ValidationRule';
import {
  FieldMetadataType,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

const REQUEST_ID = 'creation-request';
const OBJECT_METADATA_ID = 'company-object';
const PAGE_LAYOUT_ID = 'company-record-form';
const PAGE_LAYOUT_TAB_ID = 'company-record-form-fields';

const buildTextField = (name: string, label: string) => ({
  id: `field-${name}`,
  universalIdentifier: `field-${name}`,
  name,
  label,
  type: FieldMetadataType.TEXT,
  icon: 'IconAbc',
  isActive: true,
  isSystem: false,
  isUIEditable: true,
  isNullable: true,
  settings: null,
});

const NAME_FIELD = buildTextField('name', 'Name');
const DOMAIN_FIELD = buildTextField('domain', 'Domain');
const NICKNAME_FIELD = buildTextField('nickname', 'Nickname');
const SECRET_FIELD = buildTextField('secret', 'Secret');
const INTERNAL_NOTE_FIELD = buildTextField('internalNote', 'Internal note');

const COMPANY_OBJECT = {
  id: OBJECT_METADATA_ID,
  nameSingular: 'company',
  namePlural: 'companies',
  labelSingular: 'Company',
  labelPlural: 'Companies',
  fields: [
    NAME_FIELD,
    DOMAIN_FIELD,
    NICKNAME_FIELD,
    SECRET_FIELD,
    INTERNAL_NOTE_FIELD,
  ],
};

const NICKNAME_RULE: ValidationRule = {
  id: 'nickname-rule',
  objectMetadataId: OBJECT_METADATA_ID,
  name: 'Nickname is required',
  description: null,
  icon: null,
  errorFieldMetadataId: NICKNAME_FIELD.id,
  expression: 'isNonEmptyString(nickname)',
  message: 'A company needs a nickname',
  isActive: true,
};

const settleRecordCreationDraft = jest.fn();
let mockValidationRules: ValidationRule[] = [];

jest.mock('@/object-metadata/hooks/useObjectMetadataItemById', () => ({
  useObjectMetadataItemById: () => ({ objectMetadataItem: COMPANY_OBJECT }),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({ objectMetadataItems: [COMPANY_OBJECT] }),
}));

jest.mock('@/object-record/hooks/useObjectPermissionsForObject', () => ({
  useObjectPermissionsForObject: () => ({
    restrictedFields: {
      'field-secret': { canRead: true, canUpdate: false },
      'field-internalNote': { canRead: true, canUpdate: false },
    },
  }),
}));

jest.mock(
  '@/object-record/record-form/hooks/useRecordCreationFormSettle',
  () => ({
    useRecordCreationFormSettle: () => ({ settleRecordCreationDraft }),
  }),
);

jest.mock('@/validation-rules/hooks/useValidationRules', () => ({
  useValidationRules: () => ({ validationRules: mockValidationRules }),
}));

jest.mock('@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement', () => ({
  useHotkeysOnFocusedElement: () => undefined,
}));

jest.mock(
  '@/object-record/record-form/components/RecordFormFieldInputs',
  () => {
    const ReactForMock = require('react') as {
      createElement: typeof createElement;
      Fragment: typeof Fragment;
    };

    return {
      RecordFormFieldInputs: ({
        fieldMetadataItems,
        draftRecord,
        onFieldValueChange,
      }: {
        fieldMetadataItems: { id: string; name: string; label: string }[];
        draftRecord: Record<string, unknown>;
        onFieldValueChange: (gqlFieldName: string, value: string) => void;
      }) =>
        ReactForMock.createElement(
          ReactForMock.Fragment,
          null,
          fieldMetadataItems.map((fieldMetadataItem) =>
            ReactForMock.createElement('input', {
              key: fieldMetadataItem.id,
              'aria-label': fieldMetadataItem.label,
              value: (draftRecord[fieldMetadataItem.name] as string) ?? '',
              onChange: (event: { target: { value: string } }) =>
                onFieldValueChange(fieldMetadataItem.name, event.target.value),
            }),
          ),
        ),
    };
  },
);

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
    __typename: 'PageLayoutWidgetVerticalListPosition',
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
      buildFormFieldWidget(INTERNAL_NOTE_FIELD.id, 4, true),
    ],
    draft: [],
    status: 'up-to-date',
  });
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <I18nProvider i18n={i18n}>
      <SidePanelPageComponentInstanceContext.Provider
        value={{ instanceId: REQUEST_ID }}
      >
        <MemoryRouter>{children}</MemoryRouter>
      </SidePanelPageComponentInstanceContext.Provider>
    </I18nProvider>
  </JotaiProvider>
);

const renderPage = () =>
  render(<SidePanelRecordCreationFormPage />, { wrapper: Wrapper });

describe('SidePanelRecordCreationFormPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    mockValidationRules = [];
    settleRecordCreationDraft.mockResolvedValue({
      validationRuleViolationFieldMetadataIds: [],
    });
    seedRecordFormPageLayout();
    jotaiStore.set(
      recordCreationFormRequestComponentState.atomFamily({
        instanceId: REQUEST_ID,
      }),
      {
        requestId: REQUEST_ID,
        objectMetadataId: OBJECT_METADATA_ID,
        initialDraftRecord: {},
      },
    );
  });

  it('shows the visible fields the user can update', () => {
    renderPage();

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Domain')).toBeInTheDocument();
    expect(screen.queryByLabelText('Internal note')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Nickname')).not.toBeInTheDocument();
  });

  it('reveals the hidden fields the user can update on demand', async () => {
    const user = userEvent.setup();

    renderPage();

    await user.click(
      screen.getByRole('button', { name: 'Show hidden fields (1)' }),
    );

    expect(screen.getByLabelText('Nickname')).toBeInTheDocument();
    expect(screen.queryByLabelText('Secret')).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Collapse hidden fields' }),
    );

    expect(screen.queryByLabelText('Nickname')).not.toBeInTheDocument();
  });

  it('submits a value typed in a hidden field after collapsing it', async () => {
    const user = userEvent.setup();

    renderPage();

    await user.click(
      screen.getByRole('button', { name: 'Show hidden fields (1)' }),
    );
    await user.type(screen.getByLabelText('Nickname'), 'Apple');
    await user.click(
      screen.getByRole('button', { name: 'Collapse hidden fields' }),
    );
    await user.click(screen.getByTestId('record-creation-form-create-button'));

    expect(settleRecordCreationDraft).toHaveBeenCalledTimes(1);
    expect(settleRecordCreationDraft).toHaveBeenCalledWith({
      requestId: REQUEST_ID,
      draftRecord: { nickname: 'Apple' },
    });
  });

  it('restores the draft and revealed fields when the form is shown again', async () => {
    const user = userEvent.setup();

    const { unmount } = renderPage();

    await user.type(screen.getByLabelText('Name'), 'Apple');
    await user.click(
      screen.getByRole('button', { name: 'Show hidden fields (1)' }),
    );
    await user.type(screen.getByLabelText('Nickname'), 'Big Apple');

    unmount();
    renderPage();

    expect(screen.getByLabelText('Name')).toHaveValue('Apple');
    expect(screen.getByLabelText('Nickname')).toHaveValue('Big Apple');
  });

  it('reveals a hidden field targeted by a validation error and keeps the message', async () => {
    const user = userEvent.setup();

    mockValidationRules = [NICKNAME_RULE];

    renderPage();

    await user.click(screen.getByTestId('record-creation-form-create-button'));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'A company needs a nickname',
    );
    expect(screen.getByLabelText('Nickname')).toBeInTheDocument();
    expect(settleRecordCreationDraft).not.toHaveBeenCalled();
  });

  it('keeps hidden fields collapsed for a validation error on the whole record', async () => {
    const user = userEvent.setup();

    mockValidationRules = [{ ...NICKNAME_RULE, errorFieldMetadataId: null }];

    renderPage();

    await user.click(screen.getByTestId('record-creation-form-create-button'));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'A company needs a nickname',
    );
    expect(screen.queryByLabelText('Nickname')).not.toBeInTheDocument();
  });

  it('reveals a hidden field the server rejected through a validation rule', async () => {
    const user = userEvent.setup();

    settleRecordCreationDraft.mockResolvedValue({
      validationRuleViolationFieldMetadataIds: [NICKNAME_FIELD.id],
    });

    renderPage();

    await user.click(screen.getByTestId('record-creation-form-create-button'));

    expect(screen.getByLabelText('Nickname')).toBeInTheDocument();
  });
});
