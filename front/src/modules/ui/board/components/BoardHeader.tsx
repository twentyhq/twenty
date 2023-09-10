import type { ComponentProps, Context, ReactNode } from 'react';
import styled from '@emotion/styled';

import { DropdownRecoilScopeContext } from '@/ui/dropdown/states/recoil-scope-contexts/DropdownRecoilScopeContext';
import { TopBar } from '@/ui/top-bar/TopBar';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { FilterDropdownButton } from '@/ui/view-bar/components/FilterDropdownButton';
import { SortDropdownButton } from '@/ui/view-bar/components/SortDropdownButton';
import ViewBarDetails from '@/ui/view-bar/components/ViewBarDetails';
import { FiltersHotkeyScope } from '@/ui/view-bar/types/FiltersHotkeyScope';
import { SortType } from '@/ui/view-bar/types/interface';

import type { BoardColumnDefinition } from '../types/BoardColumnDefinition';
import { BoardOptionsHotkeyScope } from '../types/BoardOptionsHotkeyScope';

import { BoardOptionsDropdown } from './BoardOptionsDropdown';

type OwnProps<SortField> = ComponentProps<'div'> & {
  viewName: string;
  viewIcon?: ReactNode;
  availableSorts?: Array<SortType<SortField>>;
  onStageAdd?: (boardColumn: BoardColumnDefinition) => void;
  context: Context<string | null>;
};

const StyledIcon = styled.div`
  display: flex;
  margin-left: ${({ theme }) => theme.spacing(1)};
  margin-right: ${({ theme }) => theme.spacing(2)};

  & > svg {
    font-size: ${({ theme }) => theme.icon.size.sm};
  }
`;

export function BoardHeader<SortField>({
  viewName,
  viewIcon,
  availableSorts,
  onStageAdd,
  context,
  ...props
}: OwnProps<SortField>) {
  return (
    <RecoilScope SpecificContext={DropdownRecoilScopeContext}>
      <TopBar
        {...props}
        displayBottomBorder={false}
        leftComponent={
          <>
            <StyledIcon>{viewIcon}</StyledIcon>
            {viewName}
          </>
        }
        rightComponent={
          <>
            <FilterDropdownButton
              context={context}
              hotkeyScope={FiltersHotkeyScope.FilterDropdownButton}
            />
            <SortDropdownButton<SortField>
              context={context}
              availableSorts={availableSorts || []}
              hotkeyScope={FiltersHotkeyScope.FilterDropdownButton}
            />
            <BoardOptionsDropdown
              customHotkeyScope={{ scope: BoardOptionsHotkeyScope.Dropdown }}
              onStageAdd={onStageAdd}
            />
          </>
        }
        bottomComponent={<ViewBarDetails context={context} />}
      />
    </RecoilScope>
  );
}
