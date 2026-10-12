import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { WorkspacesForSignIn } from '@/navigation/components/MultiWorkspaceDropdown/internal/components/WorkspacesForSignIn';
import { WorkspacesForSignUp } from '@/navigation/components/MultiWorkspaceDropdown/internal/components/WorkspacesForSignUp';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';

export const MultiWorkspaceDropdownWorkspacesListComponents = () => {
  const { t } = useLingui();
  const availableWorkspaces = useAtomStateValue(availableWorkspacesState);
  const [searchValue, setSearchValue] = useState('');

  return (
    <>
      <Dropdown.Back>{t`Other workspaces`}</Dropdown.Back>
      <Dropdown.Search
        placeholder={t`Search`}
        aria-label={t`Search`}
        value={searchValue}
        onValueChange={setSearchValue}
      />
      <Dropdown.Separator />
      <WorkspacesForSignIn searchValue={searchValue} />
      {isNonEmptyArray(availableWorkspaces.availableWorkspacesForSignUp) && (
        <WorkspacesForSignUp searchValue={searchValue} />
      )}
    </>
  );
};
