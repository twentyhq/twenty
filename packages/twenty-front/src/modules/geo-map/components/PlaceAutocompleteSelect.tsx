import { PlaceAutocompleteResult } from '@/geo-map/types/placeApi';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownOffset } from '@/ui/layout/dropdown/types/DropdownOffset';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import styled from '@emotion/styled';
import { useMemo, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { SelectOption } from 'twenty-ui/input';
import { MenuItemSelectTag } from 'twenty-ui/navigation';
const StyledContainer = styled.div<{ fullWidth?: boolean }>`
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

export const PlaceAutocompleteSelect = ({
  list,
  onChange,
  dropdownId,
  excludedClickOutsideIds,
  onClickOutside,
  dropdownOffset,
}: {
  list: PlaceAutocompleteResult[];
  onChange: (placeId: string) => void;
  dropdownId: string;
  excludedClickOutsideIds?: string[];
  onClickOutside?: () => void;
  dropdownOffset?: DropdownOffset;
}) => {
  const selectContainerRef = useRef<HTMLDivElement>(null);
  const options: SelectOption<string>[] = useMemo(() => {
    return list?.map<SelectOption<string>>(({ placeId, text }) => ({
      label: text,
      value: placeId,
    }));
  }, [list]);

  if (!isDefined(options) || options.length <= 0) return null;

  const selectableItemIdArray = options.map((option) => option.value);

  return (
    <StyledContainer tabIndex={0} ref={selectContainerRef} fullWidth={true}>
      <Dropdown
        dropdownId={dropdownId}
        dropdownPlacement="bottom-start"
        dropdownOffset={dropdownOffset}
        excludedClickOutsideIds={excludedClickOutsideIds}
        onClickOutside={onClickOutside}
        isFlipDisabled={true}
        dropdownComponents={
          <SelectableList
            selectableListInstanceId={dropdownId}
            selectableItemIdArray={selectableItemIdArray}
            focusId={dropdownId}
          >
            <DropdownContent
              ref={selectContainerRef}
              selectDisabled
              widthInPixels={350}
            >
              <DropdownMenuItemsContainer hasMaxHeight>
                {options.map((option) => {
                  return (
                    <SelectableListItem
                      key={option.value}
                      itemId={option.value}
                      onEnter={() => onChange(option.value)}
                    >
                      <MenuItemSelectTag
                        key={option.value}
                        text={option.label}
                        color={'transparent'}
                        onClick={() => onChange(option.value)}
                      />
                    </SelectableListItem>
                  );
                })}
              </DropdownMenuItemsContainer>
            </DropdownContent>
          </SelectableList>
        }
      />
    </StyledContainer>
  );
};
