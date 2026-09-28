import { type PlaceAutocompleteResult } from '@/geo-map/types/PlaceApi';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { styled } from '@linaria/react';
import { useMemo, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/primitives/data-display';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { ListItem } from 'twenty-ui/primitives/navigation';
const StyledContainer = styled.div<{ fullWidth?: boolean }>`
  margin-bottom: 0px !important;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

export const PlaceAutocompleteSelect = ({
  list,
  onChange,
  dropdownId,
}: {
  list: PlaceAutocompleteResult[];
  onChange: (placeId: string) => void;
  dropdownId: string;
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
      <SelectableList
        selectableListInstanceId={dropdownId}
        selectableItemIdArray={selectableItemIdArray}
        focusId={dropdownId}
      >
        <LegacyDropdownContent
          ref={selectContainerRef}
          selectDisabled
          widthInPixels={345}
        >
          <DropdownMenuItemsContainer hasMaxHeight>
            {options.map((option) => {
              return (
                <SelectableListItem
                  key={option.value}
                  itemId={option.value}
                  onEnter={() => onChange(option.value)}
                >
                  <ListItem
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    role="option"
                    aria-selected={false}
                    selected={false}
                    indicator="check"
                  >
                    <Tag
                      color={'transparent'}
                      borderStyle="dashed"
                      variant={'soft'}
                    >
                      {option.label}
                    </Tag>
                  </ListItem>
                </SelectableListItem>
              );
            })}
          </DropdownMenuItemsContainer>
        </LegacyDropdownContent>
      </SelectableList>
    </StyledContainer>
  );
};
