import { useState } from 'react';
import styled from '@emotion/styled';
import {
  autoUpdate,
  flip,
  offset,
  size,
  useFloating,
} from '@floating-ui/react';

import { useHandleCheckableCommentThreadTargetChange } from '@/comments/hooks/useHandleCheckableCommentThreadTargetChange';
import { CommentableEntity } from '@/comments/types/CommentableEntity';
import { CommentableEntityForSelect } from '@/comments/types/CommentableEntityForSelect';
import CompanyChip from '@/companies/components/CompanyChip';
import { useHotkeysScopeOnBooleanState } from '@/hotkeys/hooks/useHotkeysScopeOnBooleanState';
import { useScopedHotkeys } from '@/hotkeys/hooks/useScopedHotkeys';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { PersonChip } from '@/people/components/PersonChip';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { MultipleEntitySelect } from '@/relation-picker/components/MultipleEntitySelect';
import { useFilteredSearchEntityQuery } from '@/relation-picker/hooks/useFilteredSearchEntityQuery';
import { useListenClickOutsideArrayOfRef } from '@/ui/hooks/useListenClickOutsideArrayOfRef';
import { flatMapAndSortEntityForSelectArrayOfArrayByName } from '@/ui/utils/flatMapAndSortEntityForSelectArrayByName';
import { getLogoUrlFromDomainName } from '@/utils/utils';
import {
  CommentableType,
  GetCommentThreadQuery,
  useSearchCompanyQuery,
  useSearchPeopleQuery,
} from '~/generated/graphql';

type OwnProps = {
  commentThread?: GetCommentThreadQuery['findManyCommentThreads'][0];
  preselected?: CommentableEntity[];
};

const StyledContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-start;

  width: 100%;
`;

const StyledRelationContainer = styled.div`
  --horizontal-padding: ${({ theme }) => theme.spacing(1)};
  --vertical-padding: ${({ theme }) => theme.spacing(1.5)};

  border: 1px solid transparent;

  cursor: pointer;

  display: flex;
  flex-wrap: wrap;

  gap: ${({ theme }) => theme.spacing(2)};

  &:hover {
    background-color: ${({ theme }) => theme.background.secondary};
    border: 1px solid ${({ theme }) => theme.border.color.light};
  }

  min-height: calc(32px - 2 * var(--vertical-padding));

  overflow: hidden;

  padding: var(--vertical-padding) var(--horizontal-padding);
  width: calc(100% - 2 * var(--horizontal-padding));
`;

const StyledMenuWrapper = styled.div`
  z-index: ${({ theme }) => theme.lastLayerZIndex};
`;

export function CommentThreadRelationPicker({
  commentThread,
  preselected,
}: OwnProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  useHotkeysScopeOnBooleanState(
    { scope: InternalHotkeysScope.RelationPicker },
    isMenuOpen,
  );

  const peopleIds =
    commentThread?.commentThreadTargets
      ?.filter((relation) => relation.commentableType === 'Person')
      .map((relation) => relation.commentableId) ?? [];
  const companyIds =
    commentThread?.commentThreadTargets
      ?.filter((relation) => relation.commentableType === 'Company')
      .map((relation) => relation.commentableId) ?? [];

  preselected?.map((commentable) => {
    if (
      commentable.id &&
      commentable.type === CommentableType.Person &&
      !peopleIds.includes(commentable.id)
    ) {
      peopleIds.push(commentable.id);
    }
    if (
      commentable.id &&
      commentable.type === CommentableType.Company &&
      !companyIds.includes(commentable.id)
    ) {
      companyIds.push(commentable.id);
    }
    return null;
  });

  const personsForMultiSelect = useFilteredSearchEntityQuery({
    queryHook: useSearchPeopleQuery,
    searchOnFields: ['firstName', 'lastName'],
    orderByField: 'lastName',
    selectedIds: peopleIds,
    mappingFunction: (entity) =>
      ({
        id: entity.id,
        entityType: CommentableType.Person,
        name: `${entity.firstName} ${entity.lastName}`,
        avatarType: 'rounded',
      } as CommentableEntityForSelect),
    searchFilter,
  });

  const companiesForMultiSelect = useFilteredSearchEntityQuery({
    queryHook: useSearchCompanyQuery,
    searchOnFields: ['name'],
    orderByField: 'name',
    selectedIds: companyIds,
    mappingFunction: (company) =>
      ({
        id: company.id,
        entityType: CommentableType.Company,
        name: company.name,
        avatarUrl: getLogoUrlFromDomainName(company.domainName),
        avatarType: 'squared',
      } as CommentableEntityForSelect),
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

  useScopedHotkeys(
    ['esc', 'enter'],
    () => {
      exitEditMode();
    },
    InternalHotkeysScope.RelationPicker,
    [exitEditMode],
  );

  const { refs, floatingStyles } = useFloating({
    strategy: 'absolute',
    middleware: [
      offset(({ rects }) => {
        return -rects.reference.height;
      }),
      flip(),
      size(),
    ],
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
      <StyledRelationContainer
        ref={refs.setReference}
        onClick={handleRelationContainerClick}
      >
        {selectedEntities?.map((entity) =>
          entity.entityType === CommentableType.Company ? (
            <CompanyChip
              key={entity.id}
              id={entity.id}
              name={entity.name}
              picture={entity.avatarUrl}
            />
          ) : (
            <PersonChip key={entity.id} name={entity.name} id={entity.id} />
          ),
        )}
      </StyledRelationContainer>
      {isMenuOpen && (
        <RecoilScope>
          <StyledMenuWrapper ref={refs.setFloating} style={floatingStyles}>
            <MultipleEntitySelect
              entities={{
                entitiesToSelect,
                filteredSelectedEntities,
                selectedEntities,
                loading: false, // TODO implement skeleton loading
              }}
              onItemCheckChange={handleCheckItemChange}
              onSearchFilterChange={handleFilterChange}
              searchFilter={searchFilter}
            />
          </StyledMenuWrapper>
        </RecoilScope>
      )}
    </StyledContainer>
  );
}
