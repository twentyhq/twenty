import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ComponentProps } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { ConditionalDisplaySettings } from '@/conditional-display/components/ConditionalDisplaySettings';
import {
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import {
  GetRolesDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { mockedRoles } from '~/testing/mock-data/generated/metadata/roles/mock-roles-data';
import { mockedUserData } from '~/testing/mock-data/users';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

jest.mock('@/object-record/record-field/ui/components/FormFieldInput', () => ({
  FormFieldInput: () => <div data-testid="form-field-input" />,
}));

const memberRole = mockedRoles.find((role) => role.label === 'Member')!;

const companyObjectMetadataItem = getTestEnrichedObjectMetadataItemsMock().find(
  (objectMetadataItem) => objectMetadataItem.nameSingular === 'company',
)!;

const workPolicyFieldMetadataItem = companyObjectMetadataItem.fields.find(
  (fieldMetadataItem) => fieldMetadataItem.name === 'workPolicy',
)!;

const remoteWorkOption = workPolicyFieldMetadataItem.options!.find(
  (option) => option.label === 'Remote Work',
)!;

const renderConditionalDisplaySettings = ({
  surface = 'navigationMenuItem',
  surfaceId = 'navigation-menu-item-id',
  conditionalDisplay = null,
  objectMetadataId,
  onConditionalDisplayChange,
}: Pick<
  ComponentProps<typeof ConditionalDisplaySettings>,
  'onConditionalDisplayChange'
> &
  Partial<
    Pick<
      ComponentProps<typeof ConditionalDisplaySettings>,
      'surface' | 'surfaceId' | 'conditionalDisplay' | 'objectMetadataId'
    >
  >) =>
  render(
    <MemoryRouter>
      <I18nProvider i18n={i18n}>
        <ConditionalDisplaySettings
          surface={surface}
          surfaceId={surfaceId}
          conditionalDisplay={conditionalDisplay}
          objectMetadataId={objectMetadataId}
          onConditionalDisplayChange={onConditionalDisplayChange}
        />
      </I18nProvider>
    </MemoryRouter>,
    {
      wrapper: getJestMetadataAndApolloMocksWrapper({
        onInitializeJotaiStore: (store) => {
          store.set(currentUserWorkspaceState.atom, {
            ...mockedUserData.currentUserWorkspace,
            permissionFlags: [PermissionFlagType.ROLES],
          });
        },
        apolloMocks: [
          {
            request: { query: GetRolesDocument },
            result: {
              data: { getRoles: mockedRoles, getPermissionFlags: [] },
            },
          },
        ],
      }),
    },
  );

const openCustomRule = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByText('Everyone'));
  await user.click(await screen.findByText('Custom rule'));
};

describe('ConditionalDisplaySettings', () => {
  it('opens a first role row as soon as a custom rule is chosen', async () => {
    const user = userEvent.setup();
    const onConditionalDisplayChange = jest.fn();

    renderConditionalDisplaySettings({ onConditionalDisplayChange });

    await openCustomRule(user);

    expect(await screen.findByText('Role')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Add filter' }),
    ).not.toBeInTheDocument();

    await user.click(await screen.findByLabelText('Select options'));
    await user.click(await screen.findByText(memberRole.label));

    expect(onConditionalDisplayChange).toHaveBeenLastCalledWith({
      recordFilters: [
        expect.objectContaining({
          contextKey: 'currentRoleId',
          operand: ViewFilterOperand.IS,
          value: JSON.stringify([memberRole.id]),
        }),
      ],
      recordFilterGroups: [
        expect.objectContaining({
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
        }),
      ],
    });
  });

  it('shows a stored role rule on its role row', async () => {
    renderConditionalDisplaySettings({
      conditionalDisplay: {
        recordFilters: [
          {
            id: 'role-filter',
            contextKey: 'currentRoleId',
            operand: ViewFilterOperand.IS,
            value: JSON.stringify([memberRole.id]),
          },
        ],
        recordFilterGroups: [],
      },
      onConditionalDisplayChange: jest.fn(),
    });

    expect(await screen.findByText('Custom rule')).toBeInTheDocument();
    expect(await screen.findByText('Role')).toBeInTheDocument();
    expect(await screen.findByText(memberRole.label)).toBeInTheDocument();
  });

  it('stores no rule once the last rule row is removed', async () => {
    const user = userEvent.setup();
    const onConditionalDisplayChange = jest.fn();

    renderConditionalDisplaySettings({ onConditionalDisplayChange });

    await openCustomRule(user);

    expect(await screen.findByText('Role')).toBeInTheDocument();

    await user.click(
      await screen.findByLabelText('Record filter rule options'),
    );
    await user.click(await screen.findByText('Remove rule'));

    expect(onConditionalDisplayChange).toHaveBeenLastCalledWith(null);
    expect(
      await screen.findByRole('button', { name: 'Add filter' }),
    ).toBeInTheDocument();
  });

  it('stores a record field rule with its operand and value', async () => {
    const user = userEvent.setup();
    const onConditionalDisplayChange = jest.fn();

    renderConditionalDisplaySettings({
      surface: 'pageLayoutWidget',
      surfaceId: 'widget-id',
      objectMetadataId: companyObjectMetadataItem.id,
      onConditionalDisplayChange,
    });

    await openCustomRule(user);
    await user.click(await screen.findByText('Role'));
    await user.click(await screen.findByText('Work Policy'));
    await user.click(await screen.findByText('Contains'));
    await user.click(await screen.findByText("Doesn't contain"));
    await user.click(await screen.findByLabelText('Select options'));
    await user.click(await screen.findByText('Remote Work'));

    expect(onConditionalDisplayChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        recordFilters: [
          expect.objectContaining({
            fieldMetadataId: workPolicyFieldMetadataItem.id,
            operand: ViewFilterOperand.DOES_NOT_CONTAIN,
            value: JSON.stringify([remoteWorkOption.value]),
          }),
        ],
      }),
    );
  });
});
