import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { multiWorkspaceDropdownStateV2 } from '@/ui/navigation/navigation-drawer/states/multiWorkspaceDropdownStateV2';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { IconChevronLeft } from 'twenty-ui/display';

import { WorkspacesForSignIn } from './components/WorkspacesForSignIn';
import { WorkspacesForSignUp } from './components/WorkspacesForSignUp';
import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';

export const MultiWorkspaceDropdownWorkspacesListComponents = () => {
  const { t } = useLingui();

  const availableWorkspaces = useRecoilValue(availableWorkspacesState);

  const setMultiWorkspaceDropdownState = useSetRecoilStateV2(
    multiWorkspaceDropdownStateV2,
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
