import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { FieldMetadataLink } from '@/ai/components/FieldMetadataLink';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { type Store } from 'jotai/vanilla/store';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const nameFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'name',
});

const setPermissionFlags = (
  store: Store,
  permissionFlags: PermissionFlagType[],
) => {
  store.set(currentUserWorkspaceState.atom, {
    permissionFlags,
    twoFactorAuthenticationMethodSummary: [],
    objectsPermissions: [],
  });
};

const renderFieldMetadataLink = ({
  fieldMetadataItemId,
  displayName,
  permissionFlags,
}: {
  fieldMetadataItemId: string;
  displayName: string;
  permissionFlags: PermissionFlagType[];
}) => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore: (store) =>
      setPermissionFlags(store, permissionFlags),
  });

  return render(
    <MemoryRouter>
      <FieldMetadataLink
        fieldMetadataItemId={fieldMetadataItemId}
        displayName={displayName}
      />
    </MemoryRouter>,
    { wrapper: Wrapper },
  );
};

describe('FieldMetadataLink', () => {
  it('should link a field to its settings page', () => {
    renderFieldMetadataLink({
      fieldMetadataItemId: nameFieldMetadataItem.id,
      displayName: 'Name',
      permissionFlags: [PermissionFlagType.DATA_MODEL],
    });

    expect(screen.getByText('Name').closest('a')).toHaveAttribute(
      'href',
      `/settings/objects/${companyObjectMetadataItem.namePlural}/${nameFieldMetadataItem.name}`,
    );
  });

  it('should render a chip without a link when the user cannot access the data model', () => {
    renderFieldMetadataLink({
      fieldMetadataItemId: nameFieldMetadataItem.id,
      displayName: 'Name',
      permissionFlags: [],
    });

    expect(screen.getByText('Name').closest('a')).toBeNull();
    expect(screen.getByTestId('chip')).toBeInTheDocument();
  });

  it('should render plain text for an unknown field id', () => {
    renderFieldMetadataLink({
      fieldMetadataItemId: '33333333-3333-3333-3333-333333333333',
      displayName: 'Partner type',
      permissionFlags: [PermissionFlagType.DATA_MODEL],
    });

    expect(screen.getByText('Partner type')).toBeInTheDocument();
    expect(screen.queryByTestId('chip')).not.toBeInTheDocument();
  });
});
