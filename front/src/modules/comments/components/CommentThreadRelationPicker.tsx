import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  autoUpdate,
  flip,
  offset,
  size,
  useFloating,
} from '@floating-ui/react';
import { IconArrowUpRight } from '@tabler/icons-react';

import { CommentThreadForDrawer } from '@/comments/types/CommentThreadForDrawer';
import CompanyChip from '@/companies/components/CompanyChip';
import { PersonChip } from '@/people/components/PersonChip';
import { useFilteredSearchEntityQuery } from '@/ui/hooks/menu/useFilteredSearchEntityQuery';
import { useListenClickOutsideArrayOfRef } from '@/ui/hooks/useListenClickOutsideArrayOfRef';
import { flatMapAndSortEntityForSelectArrayOfArrayByName } from '@/ui/utils/flatMapAndSortEntityForSelectArrayByName';
import { getLogoUrlFromDomainName } from '@/utils/utils';
import {
  CommentableType,
  useSearchCompanyQueryQuery,
  useSearchPeopleQueryQuery,
} from '~/generated/graphql';

import { useHandleCheckableCommentThreadTargetChange } from '../hooks/useHandleCheckableCommentThreadTargetChange';

import { MultipleEntitySelect } from './MultipleEntitySelect';

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

const StyledMenuWrapper = styled.div`
  z-index: ${(props) => props.theme.lastLayerZIndex};
`;

export function CommentThreadRelationPicker({ commentThread }: OwnProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const theme = useTheme();

  const peopleIds =
    commentThread.commentThreadTargets
      ?.filter((relation) => relation.commentableType === 'Person')
      .map((relation) => relation.commentableId) ?? [];

  const companyIds =
    commentThread.commentThreadTargets
      ?.filter((relation) => relation.commentableType === 'Company')
      .map((relation) => relation.commentableId) ?? [];

  const personsForMultiSelect = useFilteredSearchEntityQuery({
    queryHook: useSearchPeopleQueryQuery,
    searchOnFields: ['firstname', 'lastname'],
    orderByField: 'lastname',
    selectedIds: peopleIds,
    mappingFunction: (entity) => ({
      id: entity.id,
      entityType: CommentableType.Person,
      name: `${entity.firstname} ${entity.lastname}`,
      avatarType: 'rounded',
    }),
    searchFilter,
  });

  const companiesForMultiSelect = useFilteredSearchEntityQuery({
    queryHook: useSearchCompanyQueryQuery,
    searchOnFields: ['name'],
    orderByField: 'name',
    selectedIds: companyIds,
    mappingFunction: (company) => ({
      id: company.id,
      entityType: CommentableType.Company,
      name: company.name,
      avatarUrl: getLogoUrlFromDomainName(company.domainName),
      avatarType: 'squared',
    }),
    searchFilter,
  });

  function handleRelationContainerClick() {
    setIsMenuOpen((isOpen) => !isOpen);
  }

  // TODO: Place in a scoped recoil atom family
  function handleFilterChange(newSearchFilter: string) {
    setSearchFilter(newSearchFilter);
  }

  const handleCheckItemChange = useHandleCheckableCommentThreadTargetChange({
    commentThread,
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

  const selectedEntities = flatMapAndSortEntityForSelectArrayOfArrayByName([
    personsForMultiSelect.selectedEntities,
    companiesForMultiSelect.selectedEntities,
  ]);

  const filteredSelectedEntities =
    flatMapAndSortEntityForSelectArrayOfArrayByName([
      personsForMultiSelect.filteredSelectedEntities,
      companiesForMultiSelect.filteredSelectedEntities,
    ]);

  const entitiesToSelect = flatMapAndSortEntityForSelectArrayOfArrayByName([
    personsForMultiSelect.entitiesToSelect,
    companiesForMultiSelect.entitiesToSelect,
  ]);

  return (
    <StyledContainer>
      <StyledLabelContainer>
        <IconArrowUpRight size={16} color={theme.text40} />
        <StyledRelationLabel>Relations</StyledRelationLabel>
      </StyledLabelContainer>
      <StyledRelationContainer
        ref={refs.setReference}
        onClick={handleRelationContainerClick}
      >
        {selectedEntities?.map((entity) =>
          entity.entityType === CommentableType.Company ? (
            <CompanyChip
              key={entity.id}
              name={entity.name}
              picture={entity.avatarUrl}
            />
          ) : (
            <PersonChip key={entity.id} name={entity.name} />
          ),
        )}
      </StyledRelationContainer>
      {isMenuOpen && (
        <StyledMenuWrapper ref={refs.setFloating} style={floatingStyles}>
          <MultipleEntitySelect
            entities={{
              entitiesToSelect,
              filteredSelectedEntities,
              selectedEntities,
            }}
            onItemCheckChange={handleCheckItemChange}
            onSearchFilterChange={handleFilterChange}
            searchFilter={searchFilter}
          />
        </StyledMenuWrapper>
      )}
    </StyledContainer>
  );
}
