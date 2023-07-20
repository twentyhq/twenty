import { useCallback, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import {
  autoUpdate,
  flip,
  offset,
  size,
  useFloating,
} from '@floating-ui/react';

import { CompanyChip } from '@/companies/components/CompanyChip';
import { useFilteredSearchCompanyQuery } from '@/companies/queries';
import { PersonChip } from '@/people/components/PersonChip';
import { useFilteredSearchPeopleQuery } from '@/people/queries';
import { useListenClickOutsideArrayOfRef } from '@/ui/hooks/useListenClickOutsideArrayOfRef';
import { usePreviousHotkeyScope } from '@/ui/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/hotkey/hooks/useScopedHotkeys';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';
import { MultipleEntitySelect } from '@/ui/relation-picker/components/MultipleEntitySelect';
import { RelationPickerHotkeyScope } from '@/ui/relation-picker/types/RelationPickerHotkeyScope';
import {
  CommentableType,
  CommentThread,
  CommentThreadTarget,
} from '~/generated/graphql';

import { useHandleCheckableCommentThreadTargetChange } from '../hooks/useHandleCheckableCommentThreadTargetChange';
import { flatMapAndSortEntityForSelectArrayOfArrayByName } from '../utils/flatMapAndSortEntityForSelectArrayByName';

type OwnProps = {
  commentThread?: Pick<CommentThread, 'id'> & {
    commentThreadTargets: Array<
      Pick<CommentThreadTarget, 'id' | 'commentableId' | 'commentableType'>
    >;
  };
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

export function CommentThreadRelationPicker({ commentThread }: OwnProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const peopleIds = useMemo(
    () =>
      commentThread?.commentThreadTargets
        ?.filter((relation) => relation.commentableType === 'Person')
        .map((relation) => relation.commentableId) ?? [],
    [commentThread?.commentThreadTargets],
  );
  const companyIds = useMemo(
    () =>
      commentThread?.commentThreadTargets
        ?.filter((relation) => relation.commentableType === 'Company')
        .map((relation) => relation.commentableId) ?? [],
    [commentThread?.commentThreadTargets],
  );
  const personsForMultiSelect = useFilteredSearchPeopleQuery({
    searchFilter,
    selectedIds: peopleIds,
  });

  const companiesForMultiSelect = useFilteredSearchCompanyQuery({
    searchFilter,
    selectedIds: companyIds,
  });

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  // TODO: Place in a scoped recoil atom family
  function handleFilterChange(newSearchFilter: string) {
    setSearchFilter(newSearchFilter);
  }

  const handleCheckItemsChange = useHandleCheckableCommentThreadTargetChange({
    commentThread,
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

  const entityValuesFromProps = useMemo(
    () =>
      [...peopleIds, ...companyIds].reduce<Record<string, boolean>>(
        (result, entityId) => ({ ...result, [entityId]: true }),
        {},
      ),
    [companyIds, peopleIds],
  );
  const [entityValues, setEntityValues] = useState(entityValuesFromProps);

  const exitEditMode = useCallback(() => {
    goBackToPreviousHotkeyScope();
    setIsMenuOpen(false);
    setSearchFilter('');

    if (Object.values(entityValues).some((value) => !!value)) {
      handleCheckItemsChange(entityValues, entitiesToSelect);
    }
  }, [
    entitiesToSelect,
    entityValues,
    goBackToPreviousHotkeyScope,
    handleCheckItemsChange,
  ]);

  const handleRelationContainerClick = useCallback(() => {
    if (isMenuOpen) {
      exitEditMode();
    } else {
      setIsMenuOpen(true);
      setEntityValues(entityValuesFromProps);
      setHotkeyScopeAndMemorizePreviousScope(
        RelationPickerHotkeyScope.RelationPicker,
      );
    }
  }, [
    entityValuesFromProps,
    exitEditMode,
    isMenuOpen,
    setHotkeyScopeAndMemorizePreviousScope,
  ]);

  useScopedHotkeys(
    ['esc', 'enter'],
    () => {
      exitEditMode();
    },
    RelationPickerHotkeyScope.RelationPicker,
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

  useListenClickOutsideArrayOfRef({
    refs: [refs.floating, refs.domReference],
    callback: () => {
      exitEditMode();
    },
  });

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
              onChange={setEntityValues}
              onSearchFilterChange={handleFilterChange}
              searchFilter={searchFilter}
              value={entityValues}
            />
          </StyledMenuWrapper>
        </RecoilScope>
      )}
    </StyledContainer>
  );
}
