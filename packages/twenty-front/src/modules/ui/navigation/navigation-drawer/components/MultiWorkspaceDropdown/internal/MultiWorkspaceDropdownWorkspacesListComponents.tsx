import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { multiWorkspaceDropdownState } from '@/ui/navigation/navigation-drawer/states/multiWorkspaceDropdownState';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { IconChevronLeft } from 'twenty-ui/display';

import { WorkspacesForSignIn } from './components/WorkspacesForSignIn';
import { WorkspacesForSignUp } from './components/WorkspacesForSignUp';
import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';

export const MultiWorkspaceDropdownWorkspacesListComponents = () => {
  const { t } = useLingui();

  const availableWorkspaces = useRecoilValue(availableWorkspacesState);

  const setMultiWorkspaceDropdownState = useSetRecoilState(
    multiWorkspaceDropdownState,
  );
  const [searchValue, setSearchValue] = useState('');

  return (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => setMultiWorkspaceDropdownState('default')}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Other workspaces`}
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        placeholder={t`Search`}
        autoFocus
        onChange={(event) => {
          setSearchValue(event.target.value);
        }}
      />
      <DropdownMenuSeparator />
      <WorkspacesForSignIn searchValue={searchValue} />
      {availableWorkspaces.availableWorkspacesForSignUp.length > 0 && (
        <WorkspacesForSignUp searchValue={searchValue} />
      )}
    </DropdownContent>
  );
};
