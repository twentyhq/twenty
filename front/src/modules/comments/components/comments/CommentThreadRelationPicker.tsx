import { useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useFloating,
} from '@floating-ui/react';
import { debounce } from 'lodash';

import { CommentThreadForDrawer } from '@/comments/types/CommentThreadForDrawer';
import CompanyChip from '@/companies/components/CompanyChip';
import { DropdownMenu } from '@/ui/components/menu/DropdownMenu';
import { DropdownMenuCheckableItem } from '@/ui/components/menu/DropdownMenuCheckableItem';
import { DropdownMenuItem } from '@/ui/components/menu/DropdownMenuItem';
import { DropdownMenuItemContainer } from '@/ui/components/menu/DropdownMenuItemContainer';
import { DropdownMenuSearch } from '@/ui/components/menu/DropdownMenuSearch';
import { DropdownMenuSeparator } from '@/ui/components/menu/DropdownMenuSeparator';
import { IconArrowUpRight } from '@/ui/icons';
import { Avatar } from '@/users/components/Avatar';
import { getLogoUrlFromDomainName } from '@/utils/utils';
import { QueryMode, useSearchCompanyQueryQuery } from '~/generated/graphql';

type OwnProps = {
  commentThread: CommentThreadForDrawer;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${(props) => props.theme.spacing(2)};
  justify-content: flex-start;

  width: 100%;
`;

const StyledRelationLabel = styled.div`
  color: ${(props) => props.theme.text60};
  display: flex;
  flex-direction: row;
`;

const StyledRelationContainer = styled.div`
  --horizontal-padding: ${(props) => props.theme.spacing(1)};
  --vertical-padding: ${(props) => props.theme.spacing(1.5)};

  border: 1px solid transparent;

  cursor: pointer;

  display: flex;
  gap: ${(props) => props.theme.spacing(2)};

  height: calc(32px - 2 * var(--vertical-padding));

  &:hover {
    background-color: ${(props) => props.theme.secondaryBackground};
    border: 1px solid ${(props) => props.theme.lightBorder};
  }

  overflow: hidden;

  padding: var(--vertical-padding) var(--horizontal-padding);

  width: calc(100% - 2 * var(--horizontal-padding));
`;

// TODO: refactor icon button with new figma and merge
// const StyledAddButton = styled.div`
//   align-items: center;
//   background: ${(props) => props.theme.primaryBackgroundTransparent};
//   border-radius: ${(props) => props.theme.borderRadius};
//   box-shadow: ${(props) => props.theme.modalBoxShadow};

//   cursor: pointer;
//   display: flex;
//   flex-direction: row;

//   &:hover {
//     background-color: ${(props) => props.theme.tertiaryBackground};
//   }

//   height: 20px;
//   justify-content: center;

//   width: 20px;
// `;

export function CommentThreadRelationPicker({ commentThread }: OwnProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const debouncedSetSearchFilter = debounce(setSearchFilter, 100, {
    leading: true,
  });

  const { refs, floatingStyles } = useFloating({
    strategy: 'fixed',
    middleware: [offset(), flip(), shift(), size()],
    whileElementsMounted: autoUpdate,
    open: isMenuOpen,
  });

  const theme = useTheme();

  const companyIds = commentThread.commentThreadTargets
    ?.filter((relation) => relation.commentableType === 'Company')
    .map((relation) => relation.commentableId);

  // const personIds = commentThread.commentThreadTargets
  //   ?.filter((relation) => relation.commentableType === 'Person')
  //   .map((relation) => relation.commentableId);

  const { data: dataForChips } = useSearchCompanyQueryQuery({
    variables: {
      where: {
        id: {
          in: companyIds,
        },
      },
    },
  });

  const { data: dataForSelect } = useSearchCompanyQueryQuery({
    variables: {
      where: {
        name: {
          contains: `%${searchFilter}%`,
          mode: QueryMode.Insensitive,
        },
      },
      limit: 5,
    },
  });

  function handleFilterChange(event: React.ChangeEvent<HTMLInputElement>) {
    debouncedSetSearchFilter(event.currentTarget.value);
  }

  function handleChangeRelationsClick() {
    setIsMenuOpen((isOpen) => !isOpen);
  }

  const companiesForChips = dataForChips?.searchResults ?? [];
  const companiesForSelect = dataForSelect?.searchResults ?? [];

  return (
    <StyledContainer>
      <IconArrowUpRight size={20} color={theme.text40} />
      <StyledRelationLabel>Relations</StyledRelationLabel>
      <StyledRelationContainer
        ref={refs.setReference}
        onClick={handleChangeRelationsClick}
      >
        {companiesForChips?.map((company) => (
          <CompanyChip
            key={company.id}
            name={company.name}
            picture={getLogoUrlFromDomainName(company.domainName)}
          />
        ))}
      </StyledRelationContainer>
      {/* <StyledAddButton id="add-button" onClick={handleAddButtonClick}>
        <IconPlus size={14} color={theme.text40} strokeWidth={1.5} />
      </StyledAddButton> */}
      {isMenuOpen && (
        <DropdownMenu ref={refs.setFloating} style={floatingStyles}>
          <DropdownMenuSearch
            value={searchFilter}
            onChange={handleFilterChange}
          />
          <DropdownMenuSeparator />
          <DropdownMenuItemContainer>
            {companiesForSelect?.slice(0, 5)?.map((company) => (
              <DropdownMenuCheckableItem
                checked={
                  companiesForChips
                    ?.map((companyForChip) => companyForChip.id)
                    ?.includes(company.id) ?? false
                }
                onChange={(newCheckedValue) => {
                  if (newCheckedValue) {
                  }
                }}
              >
                <Avatar
                  avatarUrl={getLogoUrlFromDomainName(company.domainName)}
                  placeholder={company.name}
                  size={16}
                />
                {company.name}
              </DropdownMenuCheckableItem>
            ))}
            {companiesForSelect?.length === 0 && (
              <DropdownMenuItem>No result</DropdownMenuItem>
            )}
          </DropdownMenuItemContainer>
        </DropdownMenu>
      )}
    </StyledContainer>
  );
}
