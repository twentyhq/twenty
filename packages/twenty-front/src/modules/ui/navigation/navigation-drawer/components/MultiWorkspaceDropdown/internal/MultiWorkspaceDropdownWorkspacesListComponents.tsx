import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { multiWorkspaceDropdownState } from '@/ui/navigation/navigation-drawer/states/multiWorkspaceDropdownState';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { IconChevronLeft } from 'twenty-ui/display';
import { currentUserAvailableWorkspacesState } from '@/auth/states/currentUserAvailableWorkspaces';

import { MemberWorkspaces } from './components/MemberWorkspaces';
import { InvitationWorkspaces } from './components/InvitationWorkspaces';

export const MultiWorkspaceDropdownWorkspacesListComponents = () => {
  const { t } = useLingui();

  const currentUserAvailableWorkspaces = useRecoilValue(
    currentUserAvailableWorkspacesState,
  );

  const setMultiWorkspaceDropdownState = useSetRecoilState(
    multiWorkspaceDropdownState,
  );

  const [searchValue, setSearchValue] = useState('');

  return (
    <>
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
      <DropdownMenuSeparator />
      <DropdownMenuSearchInput
        placeholder={t`Search`}
        autoFocus
        onChange={(event) => {
          setSearchValue(event.target.value);
        }}
      />
      <DropdownMenuSeparator />
      <MemberWorkspaces searchValue={searchValue} />
      {currentUserAvailableWorkspaces.length > 0 && (
        <InvitationWorkspaces searchValue={searchValue} />
      )}
    </>
  );
};
