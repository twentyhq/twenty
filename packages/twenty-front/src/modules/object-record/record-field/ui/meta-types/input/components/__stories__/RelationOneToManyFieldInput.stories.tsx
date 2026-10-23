import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { useMemo, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button, Input } from 'twenty-ui/primitives/input';
import { FieldInputAnchorDecorator } from '~/testing/decorators/FieldInputAnchorDecorator';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { generateDepthRecordGqlFieldsFromRecord } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { FileUploadDecorator } from '~/testing/decorators/FileUploadDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  mockCurrentWorkspace,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import {
  FieldInputEventContext,
  type FieldInputEvent,
} from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useOpenFieldInputEditMode } from '@/object-record/record-field/ui/hooks/useOpenFieldInputEditMode';
import { RelationOneToManyFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/RelationOneToManyFieldInput';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { RecordInlineCellEditMode } from '@/object-record/record-inline-cell/components/RecordInlineCellEditMode';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { CoreObjectNameSingular, FieldMetadataType } from 'twenty-shared/types';
import { RelationType } from '~/generated-metadata/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { mockedPersonRecords } from '~/testing/mock-data/generated/data/people/mock-people-data';
import { mockedCompanyRecords } from '~/testing/mock-data/generated/data/companies/mock-companies-data';
import { mockedWorkspaceMemberRecords } from '~/testing/mock-data/generated/data/workspaceMembers/mock-workspaceMembers-data';

const COMPANY_RECORD_ID = mockedCompanyRecords[0].id;
const FIELD_INPUT_INSTANCE_ID = getRecordFieldInputInstanceId({
  recordId: COMPANY_RECORD_ID,
  fieldName: 'people',
});
const PERSON_NAME = `${mockedPersonRecords[0].name.firstName} ${mockedPersonRecords[0].name.lastName}`;
const updatePerson = fn();
const submitFieldInput = fn<FieldInputEvent>();
const tabFromFieldInput = fn<FieldInputEvent>();
const shiftTabFromFieldInput = fn<FieldInputEvent>();

const personMetadata = getMockObjectMetadataItemOrThrow('person');
const companyMetadata = getMockObjectMetadataItemOrThrow('company');
const companyFieldOnPerson = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personMetadata,
  fieldName: 'company',
});
const peopleFieldOnCompany = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyMetadata,
  fieldName: 'people',
});

type RelationOneToManyFieldInputWithContextProps = {
  isInline?: boolean;
};

const RelationOneToManyFieldInputWithContext = ({
  isInline = false,
}: RelationOneToManyFieldInputWithContextProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { openFieldInput, closeFieldInput } = useOpenFieldInputEditMode();
  const apolloCoreClient = useApolloCoreClient();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const fieldDefinition = useMemo(
    () => ({
      fieldMetadataId: peopleFieldOnCompany.id,
      label: 'People',
      type: FieldMetadataType.RELATION,
      iconName: 'IconLink',
      metadata: {
        fieldName: 'people',
        relationType: RelationType.ONE_TO_MANY,
        relationObjectMetadataNamePlural: 'people',
        relationObjectMetadataNameSingular: CoreObjectNameSingular.Person,
        relationObjectMetadataId: personMetadata.id,
        objectMetadataNameSingular: 'company',
        relationFieldMetadataId: companyFieldOnPerson.id,
        targetFieldMetadataName: 'company',
      },
    }),
    [],
  );

  const handleOpen = () => {
    const recordsWithMetadata = [
      {
        objectMetadataItem: companyMetadata,
        records: mockedCompanyRecords
          .filter(({ id }) =>
            [
              COMPANY_RECORD_ID,
              ...mockedPersonRecords
                .slice(0, 2)
                .map(({ companyId }) => companyId),
            ].includes(id),
          )
          .map(({ __typename, id, name }) => ({ __typename, id, name })),
      },
      {
        objectMetadataItem: personMetadata,
        records: mockedPersonRecords
          .slice(0, 2)
          .map(({ __typename, id, name, company, companyId }) => ({
            __typename,
            id,
            name,
            company,
            companyId,
          })),
      },
    ];

    for (const { objectMetadataItem, records } of recordsWithMetadata) {
      for (const recordNode of records) {
        const record = getRecordFromRecordNode({ recordNode });

        updateRecordFromCache({
          cache: apolloCoreClient.cache,
          objectMetadataItem,
          objectMetadataItems,
          record,
          recordGqlFields: generateDepthRecordGqlFieldsFromRecord({
            objectMetadataItem,
            objectMetadataItems,
            record,
            depth: 1,
          }),
          objectPermissionsByObjectMetadataId,
        });
      }
    }

    jotaiStore.set(
      recordStoreFamilySelector.selectorFamily({
        fieldName: 'people',
        recordId: COMPANY_RECORD_ID,
      }),
      [],
    );
    openFieldInput({ fieldDefinition, recordId: COMPANY_RECORD_ID });
    setIsOpen(true);
  };

  const handleClose = () => {
    closeFieldInput({ fieldDefinition, recordId: COMPANY_RECORD_ID });
    setIsOpen(false);
  };

  const picker = isOpen ? <RelationOneToManyFieldInput /> : null;

  return (
    <div>
      <RecordFieldComponentInstanceContext.Provider
        value={{
          instanceId: FIELD_INPUT_INSTANCE_ID,
        }}
      >
        <FieldContext.Provider
          value={{
            fieldDefinition,
            recordId: COMPANY_RECORD_ID,
            isLabelIdentifier: false,
            isRecordFieldReadOnly: false,
          }}
        >
          <FieldInputEventContext.Provider
            value={{
              onSubmit: (args) => {
                submitFieldInput(args);
                handleClose();
              },
              onTab: (args) => {
                tabFromFieldInput(args);
                handleClose();
              },
              onShiftTab: (args) => {
                shiftTabFromFieldInput(args);
                handleClose();
              },
            }}
          >
            {isInline ? (
              <div style={{ position: 'relative', width: 200, height: 80 }}>
                <RecordInlineCellEditMode>{picker}</RecordInlineCellEditMode>
              </div>
            ) : (
              picker
            )}
          </FieldInputEventContext.Provider>
        </FieldContext.Provider>
      </RecordFieldComponentInstanceContext.Provider>
      <Button onClick={handleOpen}>Edit people</Button>
      <Input aria-label="Outside input" />
      <Button>Outside picker</Button>
    </div>
  );
};
const openRelationFieldInputStory = async (canvasElement: HTMLElement) => {
  const trigger = await within(canvasElement).findByRole('button', {
    name: 'Edit people',
  });

  await userEvent.click(trigger);
};

const meta: Meta<typeof RelationOneToManyFieldInputWithContext> = {
  title: 'UI/Data/Field/Input/RelationOneToManyFieldInput',
  component: RelationOneToManyFieldInputWithContext,
  beforeEach: () => {
    updatePerson.mockClear();
    submitFieldInput.mockClear();
    tabFromFieldInput.mockClear();
    shiftTabFromFieldInput.mockClear();
    jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
    jotaiStore.set(currentWorkspaceMemberState.atom, mockedWorkspaceMemberData);

    return () => {
      jotaiStore.set(focusStackState.atom, (focusStack) =>
        focusStack.filter(({ focusId }) => focusId !== FIELD_INPUT_INSTANCE_ID),
      );
    };
  },
  decorators: [
    MemoryRouterDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    FileUploadDecorator,
    FieldInputAnchorDecorator,
  ],
  parameters: {
    clearMocks: true,
    msw: {
      handlers: [
        graphql.query('FindOneWorkspaceMember', ({ variables }) =>
          HttpResponse.json({
            data: {
              workspaceMember:
                mockedWorkspaceMemberRecords.find(
                  ({ id }) => id === variables.objectRecordId,
                ) ?? null,
            },
          }),
        ),
        graphql.mutation('UpdateOnePerson', ({ variables }) => {
          updatePerson(variables);

          return HttpResponse.json({
            data: {
              updatePerson: {
                ...mockedPersonRecords.find(
                  ({ id }) => id === variables.idToUpdate,
                ),
                companyId: variables.input.companyId,
                company:
                  mockedCompanyRecords.find(
                    ({ id }) => id === variables.input.companyId,
                  ) ?? null,
              },
            },
          });
        }),
        ...graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof RelationOneToManyFieldInputWithContext>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await openRelationFieldInputStory(canvasElement);
  },
};

export const ToggleThenEscape: Story = {
  play: async ({ canvasElement }) => {
    await openRelationFieldInputStory(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const popup = await body.findByRole('dialog', { name: 'People' });
    const firstOption = await within(popup).findByRole('option', {
      name: PERSON_NAME,
    });
    await userEvent.click(firstOption);
    await waitFor(() =>
      expect(firstOption).toHaveAttribute('aria-selected', 'true'),
    );
    await waitFor(() =>
      expect(updatePerson).toHaveBeenCalledWith({
        idToUpdate: mockedPersonRecords[0].id,
        input: { companyId: COMPANY_RECORD_ID },
      }),
    );
    expect(popup).toBeVisible();
    expect(submitFieldInput).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(submitFieldInput).toHaveBeenCalledWith({ skipPersist: true });
      expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    });
  },
};

export const OutsideInput: Story = {
  play: async ({ canvasElement }) => {
    await openRelationFieldInputStory(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await body.findByRole('dialog', { name: 'People' });
    await userEvent.click(body.getByRole('textbox', { name: 'Outside input' }));
    await waitFor(() => {
      expect(submitFieldInput).toHaveBeenCalledWith({ skipPersist: true });
      expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    });
  },
};

export const Tab: Story = {
  play: async ({ canvasElement }) => {
    await openRelationFieldInputStory(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const popup = await body.findByRole('dialog', { name: 'People' });
    await waitFor(() =>
      expect(within(popup).getByRole('searchbox')).toHaveFocus(),
    );
    await userEvent.tab();
    await waitFor(() => {
      expect(tabFromFieldInput).toHaveBeenCalledWith({ skipPersist: true });
      expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(submitFieldInput).not.toHaveBeenCalled();
  },
};

export const ShiftTab: Story = {
  play: async ({ canvasElement }) => {
    await openRelationFieldInputStory(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const popup = await body.findByRole('dialog', { name: 'People' });
    await waitFor(() =>
      expect(within(popup).getByRole('searchbox')).toHaveFocus(),
    );
    await userEvent.tab({ shift: true });
    await waitFor(() => {
      expect(shiftTabFromFieldInput).toHaveBeenCalledWith({
        skipPersist: true,
      });
      expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(submitFieldInput).not.toHaveBeenCalled();
  },
};

export const InlineAnchor: Story = {
  args: { isInline: true },
  play: async ({ canvasElement }) => {
    await openRelationFieldInputStory(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const popup = await body.findByRole('dialog', { name: 'People' });
    const anchor = within(canvasElement).getByTestId(
      'inline-cell-edit-mode-container',
    );
    await waitFor(() => {
      const anchorBounds = anchor.getBoundingClientRect();
      const popupBounds = popup.getBoundingClientRect();
      expect(
        Math.abs(popupBounds.top - (anchorBounds.bottom - 29)),
      ).toBeLessThan(2);
      expect(Math.abs(popupBounds.left - (anchorBounds.left - 5))).toBeLessThan(
        2,
      );
    });
  },
};
