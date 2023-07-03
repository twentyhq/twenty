import { ChangeEvent, useCallback, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { useRemoveSelectedFilter } from '@/filters-and-sorts/hooks/useRemoveSelectedFilter';
import { useUpsertSelectedFilter } from '@/filters-and-sorts/hooks/useUpsertSelectedFilter';
import { availableFiltersScopedState } from '@/filters-and-sorts/states/availableFiltersScopedState';
import { filterSearchInputScopedState } from '@/filters-and-sorts/states/filterSearchInputScopedState';
import { selectedFilterInDropdownScopedState } from '@/filters-and-sorts/states/selectedFilterInDropdownScopedState';
import { selectedFiltersScopedState } from '@/filters-and-sorts/states/selectedFiltersScopedState';
import { selectedOperandInDropdownScopedState } from '@/filters-and-sorts/states/selectedOperandInDropdownScopedState';
import { getOperandLabel } from '@/filters-and-sorts/utils/getOperandLabel';
import { getOperandsForFilterType } from '@/filters-and-sorts/utils/getOperandsForFilterType';
import { captureHotkeyTypeInFocusState } from '@/hotkeys/states/captureHotkeyTypeInFocusState';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/recoil-scope/hooks/useRecoilScopedValue';
import { TableContext } from '@/ui/tables/states/TableContext';

import DatePicker from '../../form/DatePicker';
import { DropdownMenuItemContainer } from '../../menu/DropdownMenuItemContainer';
import { DropdownMenuSelectableItem } from '../../menu/DropdownMenuSelectableItem';
import { DropdownMenuSeparator } from '../../menu/DropdownMenuSeparator';

import DropdownButton from './DropdownButton';

export function FilterDropdownButton() {
  const availableFilters = useRecoilScopedValue(
    availableFiltersScopedState,
    TableContext,
  );

  const [isUnfolded, setIsUnfolded] = useState(false);
  const [, setCaptureHotkeyTypeInFocus] = useRecoilState(
    captureHotkeyTypeInFocusState,
  );

  const [isOperandSelectionUnfolded, setIsOperandSelectionUnfolded] =
    useState(false);

  const [selectedFilterInDropdown, setSelectedFilterInDropdown] =
    useRecoilScopedState(selectedFilterInDropdownScopedState, TableContext);

  const [, setFilterSearchInput] = useRecoilScopedState(
    filterSearchInputScopedState,
    TableContext,
  );

  const [selectedFilters] = useRecoilScopedState(
    selectedFiltersScopedState,
    TableContext,
  );

  const [selectedOperandInDropdown, setSelectedOperandInDropdown] =
    useRecoilScopedState(selectedOperandInDropdownScopedState, TableContext);

  const operandsForFilterType = getOperandsForFilterType(
    selectedFilterInDropdown?.type,
  );

  const resetState = useCallback(() => {
    setIsOperandSelectionUnfolded(false);
    setSelectedFilterInDropdown(null);
    setSelectedOperandInDropdown(null);
    setFilterSearchInput('');
  }, [
    setSelectedFilterInDropdown,
    setSelectedOperandInDropdown,
    setFilterSearchInput,
  ]);

  const upsertSelectedFilter = useUpsertSelectedFilter();
  const removeSelectedFilter = useRemoveSelectedFilter();

  const isFilterSelected = (selectedFilters?.length ?? 0) > 0;

  return (
    <DropdownButton
      label="Filter"
      isActive={isFilterSelected}
      isUnfolded={isUnfolded}
      setIsUnfolded={setIsUnfolded}
      resetState={resetState}
    >
      {selectedFilterInDropdown && selectedOperandInDropdown ? (
        isOperandSelectionUnfolded ? (
          operandsForFilterType.map((filterOperand, index) => (
            <DropdownButton.StyledDropdownItem
              key={`select-filter-operand-${index}`}
              onClick={() => {
                setSelectedOperandInDropdown(filterOperand);
                setIsOperandSelectionUnfolded(false);
              }}
            >
              {getOperandLabel(filterOperand)}
            </DropdownButton.StyledDropdownItem>
          ))
        ) : (
          <>
            <DropdownButton.StyledDropdownTopOption
              key={'selected-filter-operand'}
              onClick={() => setIsOperandSelectionUnfolded(true)}
            >
              {getOperandLabel(selectedOperandInDropdown)}
              <DropdownButton.StyledDropdownTopOptionAngleDown />
            </DropdownButton.StyledDropdownTopOption>
            <DropdownButton.StyledSearchField autoFocus key={'search-filter'}>
              {(selectedFilterInDropdown.type === 'text' ||
                selectedFilterInDropdown.type === 'entity') && (
                <input
                  type="text"
                  placeholder={selectedFilterInDropdown.label}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    if (selectedFilterInDropdown.type === 'entity') {
                      setFilterSearchInput(event.target.value);
                    }

                    if (selectedFilterInDropdown.type === 'text') {
                      if (event.target.value === '') {
                        removeSelectedFilter(selectedFilterInDropdown.field);
                      } else {
                        upsertSelectedFilter({
                          field: selectedFilterInDropdown.field,
                          type: selectedFilterInDropdown.type,
                          value: event.target.value,
                          operand: selectedOperandInDropdown,
                          displayValue: event.target.value,
                        });
                      }
                    }
                  }}
                />
              )}
              {selectedFilterInDropdown.type === 'date' && (
                <DatePicker
                  date={new Date()}
                  onChangeHandler={(date) => {
                    upsertSelectedFilter({
                      field: selectedFilterInDropdown.field,
                      type: selectedFilterInDropdown.type,
                      value: date.toISOString(),
                      operand: selectedOperandInDropdown,
                      displayValue: date.toLocaleDateString(),
                    });
                  }}
                  customInput={<></>}
                  customCalendarContainer={styled.div`
                    top: -10px;
                  `}
                />
              )}
            </DropdownButton.StyledSearchField>
            <DropdownMenuSeparator />
            {selectedFilterInDropdown.type === 'entity' && (
              <RecoilScope>
                {selectedFilterInDropdown.searchSelectComponent}
              </RecoilScope>
            )}
          </>
        )
      ) : (
        <DropdownMenuItemContainer>
          {availableFilters.map((filter, index) => (
            <DropdownMenuSelectableItem
              key={`select-filter-${index}`}
              onClick={() => {
                setSelectedFilterInDropdown(filter);
                setSelectedOperandInDropdown(
                  getOperandsForFilterType(filter.type)?.[0],
                );

                setFilterSearchInput('');
              }}
            >
              <DropdownButton.StyledIcon>
                {filter.icon}
              </DropdownButton.StyledIcon>
              {filter.label}
            </DropdownMenuSelectableItem>
          ))}
        </DropdownMenuItemContainer>
      )}
    </DropdownButton>
  );
}
