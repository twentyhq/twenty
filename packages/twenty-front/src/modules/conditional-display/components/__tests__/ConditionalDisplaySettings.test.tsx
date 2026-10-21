import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ComponentProps } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { ConditionalDisplaySettings } from '@/conditional-display/components/ConditionalDisplaySettings';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import {
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

jest.mock('@/object-record/record-field/ui/components/FormFieldInput', () => ({
  FormFieldInput: () => <div data-testid="form-field-input" />,
}));

const SALES_ROLE_ID = 'sales-role-id';

const companyObjectMetadataItem = getTestEnrichedObjectMetadataItemsMock().find(
  (objectMetadataItem) => objectMetadataItem.nameSingular === 'company',
)!;

const workPolicyFieldMetadataItem = companyObjectMetadataItem.fields.find(
  (fieldMetadataItem) => fieldMetadataItem.name === 'workPolicy',
)!;

const remoteWorkOption = workPolicyFieldMetadataItem.options!.find(
  (option) => option.label === 'Remote Work',
)!;

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  onInitializeJotaiStore: (store) => {
    store.set(metadataStoreState.atomFamily('roles'), {
      current: [
        { id: 'admin-role-id', label: 'Admin' },
        { id: SALES_ROLE_ID, label: 'Sales' },
      ],
      draft: [],
      status: 'up-to-date',
    });
  },
});

const renderConditionalDisplaySettings = ({
  surface = 'navigationMenuItem',
  surfaceId = 'navigation-menu-item-id',
  objectMetadataId,
  onConditionalDisplayChange,
}: Pick<
  ComponentProps<typeof ConditionalDisplaySettings>,
  'onConditionalDisplayChange'
> &
  Partial<
    Pick<
      ComponentProps<typeof ConditionalDisplaySettings>,
      'surface' | 'surfaceId' | 'objectMetadataId'
    >
  >) =>
  render(
    <MemoryRouter>
      <I18nProvider i18n={i18n}>
        <ConditionalDisplaySettings
          surface={surface}
          surfaceId={surfaceId}
          conditionalDisplay={null}
          objectMetadataId={objectMetadataId}
          onConditionalDisplayChange={onConditionalDisplayChange}
        />
      </I18nProvider>
    </MemoryRouter>,
    { wrapper: Wrapper },
  );

describe('ConditionalDisplaySettings', () => {
  it('stores a role rule picked in the builder', async () => {
    const user = userEvent.setup();
    const onConditionalDisplayChange = jest.fn();

    renderConditionalDisplaySettings({ onConditionalDisplayChange });

    await user.click(await screen.findByText('Everyone'));
    await user.click(await screen.findByText('Custom rule'));

    expect(await screen.findByText('Is any of')).toBeInTheDocument();

    await user.click(await screen.findByText('Select roles'));
    await user.click(await screen.findByText('Sales'));

    expect(onConditionalDisplayChange).toHaveBeenLastCalledWith({
      recordFilters: [
        expect.objectContaining({
          contextKey: 'currentRoleId',
          operand: ViewFilterOperand.IS,
          value: JSON.stringify([SALES_ROLE_ID]),
        }),
      ],
      recordFilterGroups: [
        expect.objectContaining({
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
        }),
      ],
    });
  });

  it('shows Everyone again once the last rule row is removed', async () => {
    const user = userEvent.setup();

    renderConditionalDisplaySettings({
      onConditionalDisplayChange: jest.fn(),
    });

    await user.click(await screen.findByText('Everyone'));
    await user.click(await screen.findByText('Custom rule'));

    expect(await screen.findByText('Select roles')).toBeInTheDocument();

    await user.click(
      await screen.findByLabelText('Record filter rule options'),
    );
    await user.click(await screen.findByText('Remove rule'));

    expect(await screen.findByText('Everyone')).toBeInTheDocument();
    expect(screen.queryByText('Select roles')).not.toBeInTheDocument();
  });

  it('shows an empty state when the subject search matches nothing', async () => {
    const user = userEvent.setup();

    renderConditionalDisplaySettings({
      surface: 'pageLayoutWidget',
      surfaceId: 'widget-id',
      objectMetadataId: companyObjectMetadataItem.id,
      onConditionalDisplayChange: jest.fn(),
    });

    await user.click(await screen.findByText('Everyone'));
    await user.click(await screen.findByText('Custom rule'));
    await user.click(await screen.findByText('Role'));
    await user.type(await screen.findByLabelText('Search fields'), 'zzz');

    expect(await screen.findByText('No fields found')).toBeInTheDocument();
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

    await user.click(await screen.findByText('Everyone'));
    await user.click(await screen.findByText('Custom rule'));
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
