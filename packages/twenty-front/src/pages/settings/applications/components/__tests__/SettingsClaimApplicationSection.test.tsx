import { useLazyQuery, useMutation, useQuery } from '@apollo/client/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { SettingsClaimApplicationSection } from '~/pages/settings/applications/components/SettingsClaimApplicationSection';

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useLazyQuery: jest.fn(),
  useMutation: jest.fn(),
  useQuery: jest.fn(),
}));

jest.mock('@/settings/roles/hooks/useHasPermissionFlag', () => ({
  useHasPermissionFlag: () => false,
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => null,
}));

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({
    enqueueSuccessSnackBar: jest.fn(),
    enqueueErrorSnackBar: jest.fn(),
  }),
}));

const mockedUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
const mockedUseLazyQuery = useLazyQuery as jest.MockedFunction<
  typeof useLazyQuery
>;
const mockedUseMutation = useMutation as jest.MockedFunction<
  typeof useMutation
>;

const UNIVERSAL_IDENTIFIER = '4f6a1b2c-3d4e-4f60-8a7b-9c0d1e2f3a4b';

const renderSection = (search: string) =>
  render(
    <I18nProvider i18n={i18n}>
      <MemoryRouter
        initialEntries={[`/settings/applications${search}#developer`]}
      >
        <SettingsClaimApplicationSection />
      </MemoryRouter>
    </I18nProvider>,
  );

describe('SettingsClaimApplicationSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseQuery.mockReturnValue({
      data: undefined,
      loading: false,
      refetch: jest.fn(),
    } as never);
    mockedUseLazyQuery.mockReturnValue([
      jest.fn(),
      { loading: false },
    ] as never);
    mockedUseMutation.mockReturnValue([jest.fn(), { loading: false }] as never);
  });

  it('does not look anything up without a deep link', () => {
    renderSection('');

    expect(mockedUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ skip: true }),
    );
    expect(
      screen.getByLabelText('Package name or universal identifier'),
    ).toHaveValue('');
  });

  it('prefills and runs the lookup from the claimUniversalIdentifier deep link', () => {
    mockedUseQuery.mockReturnValue({
      data: {
        findClaimableApplicationRegistration: {
          id: 'registration-1',
          universalIdentifier: UNIVERSAL_IDENTIFIER,
          name: 'Published Catalog App',
          description: null,
          logoUrl: null,
          isOwned: false,
        },
      },
      loading: false,
      refetch: jest.fn(),
    } as never);

    renderSection(`?claimUniversalIdentifier=${UNIVERSAL_IDENTIFIER}`);

    expect(mockedUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        skip: false,
        variables: { universalIdentifier: UNIVERSAL_IDENTIFIER },
      }),
    );
    expect(
      screen.getByLabelText('Package name or universal identifier'),
    ).toHaveValue(UNIVERSAL_IDENTIFIER);
    expect(screen.getByText('Published Catalog App')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Claim with GitHub/ }),
    ).toBeInTheDocument();
  });
});
