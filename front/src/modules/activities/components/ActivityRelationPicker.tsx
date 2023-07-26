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
import { useListenClickOutside } from '@/ui/hooks/useListenClickOutside';
import { usePreviousHotkeyScope } from '@/ui/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/hotkey/hooks/useScopedHotkeys';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';
import { MultipleEntitySelect } from '@/ui/relation-picker/components/MultipleEntitySelect';
import { RelationPickerHotkeyScope } from '@/ui/relation-picker/types/RelationPickerHotkeyScope';
import { Activity, ActivityTarget, CommentableType } from '~/generated/graphql';

import { useHandleCheckableActivityTargetChange } from '../hooks/useHandleCheckableActivityTargetChange';
import { flatMapAndSortEntityForSelectArrayOfArrayByName } from '../utils/flatMapAndSortEntityForSelectArrayByName';

type OwnProps = {
  activity?: Pick<Activity, 'id'> & {
    activityTargets: Array<
      Pick<ActivityTarget, 'id' | 'commentableId' | 'commentableType'>
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

export function ActivityRelationPicker({ activity }: OwnProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedEntityIds, setSelectedEntityIds] = useState<
    Record<string, boolean>
  >({});
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const initialPeopleIds = useMemo(
    () =>
      activity?.activityTargets
        ?.filter((relation) => relation.commentableType === 'Person')
        .map((relation) => relation.commentableId) ?? [],
    [activity?.activityTargets],
  );

  const initialCompanyIds = useMemo(
    () =>
      activity?.activityTargets
        ?.filter((relation) => relation.commentableType === 'Company')
        .map((relation) => relation.commentableId) ?? [],
    [activity?.activityTargets],
  );

  const initialSelectedEntityIds = useMemo(
    () =>
      [...initialPeopleIds, ...initialCompanyIds].reduce<
        Record<string, boolean>
      >((result, entityId) => ({ ...result, [entityId]: true }), {}),
    [initialPeopleIds, initialCompanyIds],
  );

  const personsForMultiSelect = useFilteredSearchPeopleQuery({
    searchFilter,
    selectedIds: initialPeopleIds,
  });

  const companiesForMultiSelect = useFilteredSearchCompanyQuery({
    searchFilter,
    selectedIds: initialCompanyIds,
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

  const handleCheckItemsChange = useHandleCheckableActivityTargetChange({
    activity,
  });

  const exitEditMode = useCallback(() => {
    goBackToPreviousHotkeyScope();
    setIsMenuOpen(false);
    setSearchFilter('');

    if (Object.values(selectedEntityIds).some((value) => !!value)) {
      handleCheckItemsChange(selectedEntityIds, entitiesToSelect);
    }
  }, [
    entitiesToSelect,
    selectedEntityIds,
    goBackToPreviousHotkeyScope,
    handleCheckItemsChange,
  ]);

  const handleRelationContainerClick = useCallback(() => {
    if (isMenuOpen) {
      exitEditMode();
    } else {
      setIsMenuOpen(true);
      setSelectedEntityIds(initialSelectedEntityIds);
      setHotkeyScopeAndMemorizePreviousScope(
        RelationPickerHotkeyScope.RelationPicker,
      );
    }
  }, [
    initialSelectedEntityIds,
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

  useListenClickOutside({
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
              pictureUrl={entity.avatarUrl}
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
              onChange={setSelectedEntityIds}
              onSearchFilterChange={setSearchFilter}
              searchFilter={searchFilter}
              value={selectedEntityIds}
            />
          </StyledMenuWrapper>
        </RecoilScope>
      )}
    </StyledContainer>
  );
}
