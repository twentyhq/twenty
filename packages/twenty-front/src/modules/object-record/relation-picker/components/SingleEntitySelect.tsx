import { useEffect, useRef, useState } from 'react';
import { isNonEmptyString } from '@sniptt/guards';

import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { assertNotNull } from '~/utils/assert';
import { isDefined } from '~/utils/isDefined';

import { useEntitySelectSearch } from '../hooks/useEntitySelectSearch';

import {
  SingleEntitySelectBase,
  SingleEntitySelectBaseProps,
} from './SingleEntitySelectBase';

export type SingleEntitySelectProps = {
  disableBackgroundBlur?: boolean;
  onCreate?: () => void;
  width?: number;
  initialEntities?: EntityForSelect[];
  currentCompany?: string;
} & Pick<
  SingleEntitySelectBaseProps,
  | 'EmptyIcon'
  | 'emptyLabel'
  | 'entitiesToSelect'
  | 'loading'
  | 'onCancel'
  | 'onEntitySelected'
  | 'selectedEntity'
>;

export const SingleEntitySelect = ({
  EmptyIcon,
  disableBackgroundBlur = false,
  emptyLabel,
  entitiesToSelect,
  loading,
  onCancel,
  onCreate,
  onEntitySelected,
  selectedEntity,
  width = 200,
  initialEntities,
  currentCompany,
}: SingleEntitySelectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { searchFilter, handleSearchFilterChange } = useEntitySelectSearch();

  const showCreateButton = isDefined(onCreate) && searchFilter !== '';

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      event.stopImmediatePropagation();
      event.target instanceof HTMLInputElement &&
        event.target.tagName !== 'INPUT' &&
        onCancel?.();
    },
  });

  const emptyCompany = !initialEntities?.find((entity) => {
    return entity.record.companyId === currentCompany;
  });

  const entitiesInDropdown = [selectedEntity, ...entitiesToSelect].filter(
    (entity): entity is EntityForSelect =>
      assertNotNull(entity) && isNonEmptyString(entity.name),
  );

  const [initialAvailableCompany, setInitialAvailableCompany] = useState<
    EntityForSelect[]
  >([]);

  useEffect(() => {
    if (entitiesToSelect?.length > 0) {
      setInitialAvailableCompany(entitiesToSelect);
    }
  }, [entitiesToSelect]);

  const isInitialAvailableCompanyEmpty =
    initialAvailableCompany?.length === 0 &&
    emptyCompany &&
    entitiesInDropdown.length === 0;

  return (
    <DropdownMenu
      disableBlur={disableBackgroundBlur}
      ref={containerRef}
      width={width}
      data-select-disable
    >
      {!isInitialAvailableCompanyEmpty && (
        <DropdownMenuSearchInput
          value={searchFilter}
          onChange={handleSearchFilterChange}
          autoFocus
        />
      )}
      <DropdownMenuSeparator />
      <SingleEntitySelectBase
        {...{
          EmptyIcon,
          emptyLabel,
          entitiesToSelect,
          loading,
          onCancel,
          onCreate,
          onEntitySelected,
          selectedEntity,
          showCreateButton,
          emptyCompany,
          entitiesInDropdown,
          isInitialAvailableCompanyEmpty,
        }}
      />
    </DropdownMenu>
  );
};
