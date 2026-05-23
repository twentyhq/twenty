import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, fireEvent, render } from '@testing-library/react';
import { type ReactNode } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { type JsonValue } from 'type-fest';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SidePanelCreateRecordPage } from '@/side-panel/pages/create-record/components/SidePanelCreateRecordPage';

type MockFieldDefinition = {
  metadata: {
    fieldName: string;
  };
};

type MockFormFieldInputProps = {
  field: MockFieldDefinition;
  defaultValue?: JsonValue;
  onChange: (value: JsonValue) => void;
  onClear: () => void;
  readonly?: boolean;
};

type MockButtonProps = {
  onClick: () => void | Promise<void>;
  title: string;
  disabled?: boolean;
  hotkeys?: string[];
  Icon?: unknown;
  isLoading?: boolean;
};

const mockFormFieldInput = jest.fn();
const mockButton = jest.fn();
const mockCreateOneRecord = jest.fn();
const mockUseCreateOneRecord = jest.fn((_args: unknown) => ({
  createOneRecord: mockCreateOneRecord,
}));
const mockOpenRecordInSidePanel = jest.fn();
const mockEnqueueErrorSnackBar = jest.fn();
let mockCreateRecordObjectMetadataItemId = 'ship-object-metadata-id';
let mockObjectMetadataItems: EnrichedObjectMetadataItem[] = [];
let mockIndexView:
  | {
      viewFields: Array<{ fieldMetadataId: string; position: number }>;
    }
  | undefined;

jest.mock(
  '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition',
  () => ({
    formatFieldMetadataItemAsFieldDefinition: ({
      field,
    }: {
      field: { name: string };
    }): MockFieldDefinition => ({
      metadata: {
        fieldName: field.name,
      },
    }),
  }),
);

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({
    objectMetadataItems: mockObjectMetadataItems,
  }),
}));

jest.mock('@/object-record/hooks/useCreateOneRecord', () => ({
  useCreateOneRecord: (args: unknown) => mockUseCreateOneRecord(args),
}));

jest.mock('@/object-record/record-field/ui/components/FormFieldInput', () => ({
  FormFieldInput: (props: MockFormFieldInputProps) => {
    mockFormFieldInput(props);

    return null;
  },
}));

jest.mock(
  '@/object-record/record-field/ui/types/guards/isFieldRelation',
  () => ({
    isFieldRelation: (field: MockFieldDefinition) =>
      field.metadata.fieldName === 'captain',
  }),
);

jest.mock('@/side-panel/hooks/useOpenRecordInSidePanel', () => ({
  useOpenRecordInSidePanel: () => ({
    openRecordInSidePanel: mockOpenRecordInSidePanel,
  }),
}));

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({
    enqueueErrorSnackBar: mockEnqueueErrorSnackBar,
  }),
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: () => mockCreateRecordObjectMetadataItemId,
  }),
);

jest.mock('@/views/hooks/useViewOrDefaultView', () => ({
  useViewOrDefaultView: () => ({
    view: mockIndexView,
  }),
}));

jest.mock('twenty-ui/display', () => ({
  IconPlus: jest.fn(() => null),
}));

jest.mock('twenty-ui/input', () => ({
  Button: (props: MockButtonProps) => {
    mockButton(props);

    return null;
  },
}));

jest.mock('twenty-ui/layout', () => ({
  Section: ({ children }: { children: ReactNode }) => children,
}));

jest.mock('twenty-ui/utilities', () => ({
  getOsControlSymbol: () => '⌘',
}));

const buildTextField = ({
  id,
  name,
  isUIReadOnly = false,
}: {
  id: string;
  name: string;
  isUIReadOnly?: boolean;
}) => ({
  id,
  name,
  label: name,
  type: FieldMetadataType.TEXT,
  isActive: true,
  isSystem: false,
  isUIReadOnly,
  settings: null,
});

const buildRelationField = ({ id, name }: { id: string; name: string }) => ({
  id,
  name,
  label: name,
  type: FieldMetadataType.RELATION,
  isActive: true,
  isSystem: false,
  isUIReadOnly: false,
  settings: {
    relationType: 'MANY_TO_ONE',
  },
});

const shipObjectMetadataItem = {
  id: 'ship-object-metadata-id',
  nameSingular: 'ship',
  labelSingular: 'Ship',
  isActive: true,
  isSystem: false,
  fields: [
    buildTextField({ id: 'name-field-id', name: 'name' }),
    buildTextField({
      id: 'readonly-field-id',
      name: 'readonlyField',
      isUIReadOnly: true,
    }),
    buildTextField({ id: 'description-field-id', name: 'description' }),
  ],
} as EnrichedObjectMetadataItem;

const renderPage = () =>
  render(
    <I18nProvider i18n={i18n}>
      <SidePanelCreateRecordPage />
    </I18nProvider>,
  );

describe('SidePanelCreateRecordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateRecordObjectMetadataItemId = shipObjectMetadataItem.id;
    mockObjectMetadataItems = [shipObjectMetadataItem];
    mockIndexView = {
      viewFields: [
        { fieldMetadataId: 'description-field-id', position: 0 },
        { fieldMetadataId: 'name-field-id', position: 1 },
        { fieldMetadataId: 'readonly-field-id', position: 2 },
      ],
    };
    mockCreateOneRecord.mockResolvedValue({ id: 'created-ship-id' });
  });

  it('renders creatable fields in index view order and opens the created record after save', async () => {
    renderPage();

    expect(mockUseCreateOneRecord).toHaveBeenCalledWith({
      objectNameSingular: 'ship',
    });

    const renderedFieldNames = mockFormFieldInput.mock.calls.map(
      ([props]: [MockFormFieldInputProps]) => props.field.metadata.fieldName,
    );

    expect(renderedFieldNames).toEqual(['description', 'name']);

    const fieldPropsByName = new Map(
      mockFormFieldInput.mock.calls.map(
        ([props]: [MockFormFieldInputProps]) => [
          props.field.metadata.fieldName,
          props,
        ],
      ),
    );

    await act(async () => {
      fieldPropsByName.get('description')?.onChange('');
      fieldPropsByName.get('name')?.onChange('SHIPCODEX');
    });

    const latestButtonProps = mockButton.mock.calls[
      mockButton.mock.calls.length - 1
    ]?.[0] as MockButtonProps | undefined;

    expect(latestButtonProps).toBeDefined();
    expect(latestButtonProps).toEqual(
      expect.objectContaining({
        title: 'Create',
        Icon: expect.any(Function),
        hotkeys: ['⌘', '⏎'],
        disabled: false,
        isLoading: false,
      }),
    );

    await act(async () => {
      await latestButtonProps?.onClick();
    });

    expect(mockCreateOneRecord).toHaveBeenCalledWith({
      name: 'SHIPCODEX',
    });
    expect(mockOpenRecordInSidePanel).toHaveBeenCalledWith({
      recordId: 'created-ship-id',
      objectNameSingular: 'ship',
      resetNavigationStack: true,
    });
  });

  it('creates the record with the command enter shortcut', async () => {
    const { container } = renderPage();

    const fieldPropsByName = new Map(
      mockFormFieldInput.mock.calls.map(
        ([props]: [MockFormFieldInputProps]) => [
          props.field.metadata.fieldName,
          props,
        ],
      ),
    );

    await act(async () => {
      fieldPropsByName.get('name')?.onChange('SHIPKEYBOARD');
    });

    await act(async () => {
      fireEvent.keyDown(container.firstChild as HTMLElement, {
        key: 'Enter',
        metaKey: true,
      });
      await Promise.resolve();
    });

    expect(mockCreateOneRecord).toHaveBeenCalledWith({
      name: 'SHIPKEYBOARD',
    });
  });

  it('uses relation join-column names when creating the record', async () => {
    mockObjectMetadataItems = [
      {
        ...shipObjectMetadataItem,
        fields: [
          buildTextField({ id: 'name-field-id', name: 'name' }),
          buildRelationField({
            id: 'captain-field-id',
            name: 'captain',
          }),
        ],
      } as EnrichedObjectMetadataItem,
    ];
    mockIndexView = {
      viewFields: [
        { fieldMetadataId: 'name-field-id', position: 0 },
        { fieldMetadataId: 'captain-field-id', position: 1 },
      ],
    };

    renderPage();

    const fieldPropsByName = new Map(
      mockFormFieldInput.mock.calls.map(
        ([props]: [MockFormFieldInputProps]) => [
          props.field.metadata.fieldName,
          props,
        ],
      ),
    );

    await act(async () => {
      fieldPropsByName.get('name')?.onChange('SHIPRELATION');
      fieldPropsByName
        .get('captain')
        ?.onChange('00000000-0000-0000-0000-000000000001');
    });

    const latestButtonProps = mockButton.mock.calls[
      mockButton.mock.calls.length - 1
    ]?.[0] as MockButtonProps | undefined;

    await act(async () => {
      await latestButtonProps?.onClick();
    });

    expect(mockCreateOneRecord).toHaveBeenCalledWith({
      name: 'SHIPRELATION',
      captainId: '00000000-0000-0000-0000-000000000001',
    });
  });
});
