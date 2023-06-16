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
import { debounce } from 'lodash';

import CompanyChip from '@/companies/components/CompanyChip';
import { PersonChip } from '@/people/components/PersonChip';
import { DropdownMenu } from '@/ui/components/menu/DropdownMenu';
import { DropdownMenuCheckableItem } from '@/ui/components/menu/DropdownMenuCheckableItem';
import { DropdownMenuItem } from '@/ui/components/menu/DropdownMenuItem';
import { DropdownMenuItemContainer } from '@/ui/components/menu/DropdownMenuItemContainer';
import { DropdownMenuSearch } from '@/ui/components/menu/DropdownMenuSearch';
import { DropdownMenuSeparator } from '@/ui/components/menu/DropdownMenuSeparator';
import { useListenClickOutsideArrayOfRef } from '@/ui/hooks/useListenClickOutsideArrayOfRef';
import { IconArrowUpRight } from '@/ui/icons';
import { Avatar } from '@/users/components/Avatar';
import { CommentableType } from '~/generated/graphql';

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

export type EntitiesForMultipleEntitySelect = {
  selectedEntities: EntityForSelect[];
  filteredSelectedEntities: EntityForSelect[];
  entitiesToSelect: EntityForSelect[];
};

export type EntityTypeForSelect = CommentableType; // TODO: derivate from all usable entity types

export type EntityForSelect = {
  id: string;
  entityType: EntityTypeForSelect;
  name: string;
  avatarUrl?: string;
};

export function MultipleEntitySelect({
  entities,
  onItemCheckChange,
  onSearchFilterChange,
}: {
  entities: EntitiesForMultipleEntitySelect[];
  onSearchFilterChange: (newSearchFilter: string) => void;
  onItemCheckChange: (
    newCheckedValue: boolean,
    entity: EntityForSelect,
  ) => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const debouncedSetSearchFilter = debounce(onSearchFilterChange, 100, {
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

  function handleFilterChange(event: React.ChangeEvent<HTMLInputElement>) {
    debouncedSetSearchFilter(event.currentTarget.value);
    setSearchFilter(event.currentTarget.value);
  }

  function handleChangeRelationsClick() {
    setIsMenuOpen((isOpen) => !isOpen);
  }

  const sortByName = (a: EntityForSelect, b: EntityForSelect) =>
    a.name.localeCompare(b.name);

  const selectedEntities = entities
    .flatMap((entity) => entity.selectedEntities)
    .sort(sortByName);

  const filteredSelectedEntities = entities
    .flatMap((entity) => entity.filteredSelectedEntities)
    .sort(sortByName);

  const entitiesToSelect = entities
    .flatMap((entity) => entity.entitiesToSelect)
    .sort(sortByName);

  const entitiesInDropdown = [
    ...(filteredSelectedEntities ?? []),
    ...(entitiesToSelect ?? []),
  ];

  // TODO: split this component into a chip container and a generic multi select dropdown component

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
        {selectedEntities?.map((entity) =>
          // TODO: maybe pass chip rendering function as a props ?
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
        <DropdownMenu ref={refs.setFloating} style={floatingStyles}>
          <DropdownMenuSearch
            value={searchFilter}
            onChange={handleFilterChange}
          />
          <DropdownMenuSeparator />
          <DropdownMenuItemContainer>
            {entitiesInDropdown?.map((entity) => (
              <DropdownMenuCheckableItem
                key={entity.id}
                checked={
                  selectedEntities
                    ?.map((selectedEntity) => selectedEntity.id)
                    ?.includes(entity.id) ?? false
                }
                onChange={(newCheckedValue) =>
                  onItemCheckChange(newCheckedValue, entity)
                }
              >
                <Avatar
                  avatarUrl={entity.avatarUrl}
                  placeholder={entity.name}
                  size={16}
                  type={
                    // TODO: maybe pass avatar type in EntityForSelect
                    entity.entityType === CommentableType.Company
                      ? 'squared'
                      : 'rounded'
                  }
                />
                {entity.name}
              </DropdownMenuCheckableItem>
            ))}
            {entitiesInDropdown?.length === 0 && (
              <DropdownMenuItem>No result</DropdownMenuItem>
            )}
          </DropdownMenuItemContainer>
        </DropdownMenu>
      )}
    </StyledContainer>
  );
}
