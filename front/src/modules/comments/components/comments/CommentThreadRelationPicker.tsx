import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
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
import { v4 } from 'uuid';

import { CommentThreadForDrawer } from '@/comments/types/CommentThreadForDrawer';
import CompanyChip from '@/companies/components/CompanyChip';
import { DropdownMenu } from '@/ui/components/menu/DropdownMenu';
import { DropdownMenuCheckableItem } from '@/ui/components/menu/DropdownMenuCheckableItem';
import { DropdownMenuItem } from '@/ui/components/menu/DropdownMenuItem';
import { DropdownMenuItemContainer } from '@/ui/components/menu/DropdownMenuItemContainer';
import { DropdownMenuSearch } from '@/ui/components/menu/DropdownMenuSearch';
import { DropdownMenuSeparator } from '@/ui/components/menu/DropdownMenuSeparator';
import { useListenClickOutsideArrayOfRef } from '@/ui/hooks/useListenClickOutsideArrayOfRef';
import { IconArrowUpRight } from '@/ui/icons';
import { Avatar } from '@/users/components/Avatar';
import { getLogoUrlFromDomainName } from '@/utils/utils';
import {
  CommentableType,
  QueryMode,
  SortOrder,
  useAddCommentThreadTargetOnCommentThreadMutation,
  useRemoveCommentThreadTargetOnCommentThreadMutation,
  useSearchCompanyQueryQuery,
} from '~/generated/graphql';

type OwnProps = {
  commentThread: CommentThreadForDrawer;
};

const StyledContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: row;
  gap: ${(props) => props.theme.spacing(2)};
  justify-content: flex-start;

  width: 100%;
`;

const StyledLabelContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;

  gap: ${(props) => props.theme.spacing(2)};

  padding-bottom: ${(props) => props.theme.spacing(2)};
  padding-top: ${(props) => props.theme.spacing(2)};
`;

const StyledRelationLabel = styled.div`
  color: ${(props) => props.theme.text60};
  display: flex;
  flex-direction: row;

  user-select: none;
`;

const StyledRelationContainer = styled.div`
  --horizontal-padding: ${(props) => props.theme.spacing(1)};
  --vertical-padding: ${(props) => props.theme.spacing(1.5)};

  border: 1px solid transparent;

  cursor: pointer;

  display: flex;
  flex-wrap: wrap;

  gap: ${(props) => props.theme.spacing(2)};

  &:hover {
    background-color: ${(props) => props.theme.secondaryBackground};
    border: 1px solid ${(props) => props.theme.lightBorder};
  }

  min-height: calc(32px - 2 * var(--vertical-padding));

  overflow: hidden;

  padding: var(--vertical-padding) var(--horizontal-padding);
  width: calc(100% - 2 * var(--horizontal-padding));
`;

export function CommentThreadRelationPicker({ commentThread }: OwnProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const debouncedSetSearchFilter = debounce(setSearchFilter, 100, {
    leading: true,
  });

  function exitEditMode() {
    setIsMenuOpen(false);
    setSearchFilter('');
  }

  useHotkeys(
    ['esc', 'enter'],
    () => {
      exitEditMode();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [exitEditMode],
  );

  const { refs, floatingStyles } = useFloating({
    strategy: 'absolute',
    middleware: [offset(), flip(), size()],
    whileElementsMounted: autoUpdate,
    open: isMenuOpen,
    placement: 'bottom-start',
  });

  useListenClickOutsideArrayOfRef([refs.floating, refs.domReference], () => {
    exitEditMode();
  });

  const theme = useTheme();

  const companyIds = commentThread.commentThreadTargets
    ?.filter((relation) => relation.commentableType === 'Company')
    .map((relation) => relation.commentableId);

  const { data: selectedCompaniesData } = useSearchCompanyQueryQuery({
    variables: {
      where: {
        id: {
          in: companyIds,
        },
      },
      orderBy: {
        name: SortOrder.Asc,
      },
    },
  });

  const { data: filteredSelectedCompaniesData } = useSearchCompanyQueryQuery({
    variables: {
      where: {
        AND: [
          {
            name: {
              contains: `%${searchFilter}%`,
              mode: QueryMode.Insensitive,
            },
          },
          {
            id: {
              in: companyIds,
            },
          },
        ],
      },
      orderBy: {
        name: SortOrder.Asc,
      },
    },
  });

  const { data: companiesToSelectData } = useSearchCompanyQueryQuery({
    variables: {
      where: {
        AND: [
          {
            name: {
              contains: `%${searchFilter}%`,
              mode: QueryMode.Insensitive,
            },
          },
          {
            id: {
              notIn: companyIds,
            },
          },
        ],
      },
      limit: 10,
      orderBy: {
        name: SortOrder.Asc,
      },
    },
  });

  function handleFilterChange(event: React.ChangeEvent<HTMLInputElement>) {
    debouncedSetSearchFilter(event.currentTarget.value);
  }

  function handleChangeRelationsClick() {
    setIsMenuOpen((isOpen) => !isOpen);
  }

  const [addCommentThreadTargetOnCommentThread] =
    useAddCommentThreadTargetOnCommentThreadMutation({
      refetchQueries: ['GetCompanies'],
    });

  const [removeCommentThreadTargetOnCommentThread] =
    useRemoveCommentThreadTargetOnCommentThreadMutation({
      refetchQueries: ['GetCompanies'],
    });

  function handleCheckItemChange(newCheckedValue: boolean, itemId: string) {
    if (newCheckedValue) {
      addCommentThreadTargetOnCommentThread({
        variables: {
          commentableEntityId: itemId,
          commentableEntityType: CommentableType.Company,
          commentThreadId: commentThread.id,
          commentThreadTargetCreationDate: new Date().toISOString(),
          commentThreadTargetId: v4(),
        },
      });
    } else {
      const foundCorrespondingTarget = commentThread.commentThreadTargets?.find(
        (target) => target.commentableId === itemId,
      );

      if (foundCorrespondingTarget) {
        removeCommentThreadTargetOnCommentThread({
          variables: {
            commentThreadId: commentThread.id,
            commentThreadTargetId: foundCorrespondingTarget.id,
          },
        });
      }
    }
  }

  const selectedCompanies = selectedCompaniesData?.searchResults ?? [];

  const filteredSelectedCompanies =
    filteredSelectedCompaniesData?.searchResults ?? [];
  const companiesToSelect = companiesToSelectData?.searchResults ?? [];

  const companiesInDropdown = [
    ...filteredSelectedCompanies,
    ...companiesToSelect,
  ];

  return (
    <StyledContainer>
      <StyledLabelContainer>
        <IconArrowUpRight size={16} color={theme.text40} />
        <StyledRelationLabel>Relations</StyledRelationLabel>
      </StyledLabelContainer>
      <StyledRelationContainer
        ref={refs.setReference}
        onClick={handleChangeRelationsClick}
      >
        {selectedCompanies?.map((company) => (
          <CompanyChip
            key={company.id}
            name={company.name}
            picture={getLogoUrlFromDomainName(company.domainName)}
          />
        ))}
      </StyledRelationContainer>
      {isMenuOpen && (
        <DropdownMenu ref={refs.setFloating} style={floatingStyles}>
          <DropdownMenuSearch
            value={searchFilter}
            onChange={handleFilterChange}
          />
          <DropdownMenuSeparator />
          <DropdownMenuItemContainer>
            {companiesInDropdown?.map((company) => (
              <DropdownMenuCheckableItem
                key={company.id}
                checked={
                  selectedCompanies
                    ?.map((selectedCompany) => selectedCompany.id)
                    ?.includes(company.id) ?? false
                }
                onChange={(newCheckedValue) =>
                  handleCheckItemChange(newCheckedValue, company.id)
                }
              >
                <Avatar
                  avatarUrl={getLogoUrlFromDomainName(company.domainName)}
                  placeholder={company.name}
                  size={16}
                />
                {company.name}
              </DropdownMenuCheckableItem>
            ))}
            {companiesInDropdown?.length === 0 && (
              <DropdownMenuItem>No result</DropdownMenuItem>
            )}
          </DropdownMenuItemContainer>
        </DropdownMenu>
      )}
    </StyledContainer>
  );
}
