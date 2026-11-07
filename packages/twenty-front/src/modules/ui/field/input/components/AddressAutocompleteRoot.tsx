import { PlaceAutocompleteSelect } from '@/geo-map/components/PlaceAutocompleteSelect';
import { type PlaceAutocompleteResult } from '@/geo-map/types/PlaceApi';
import { AutocompleteRoot } from '@/ui/input/components/AutocompleteRoot';
import { type ReactNode } from 'react';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

type AddressAutocompleteRootProps = {
  dropdownId: string;
  isEnabled: boolean;
  places: PlaceAutocompleteResult[];
  value: string;
  onValueChange: (value: string) => void;
  onClose: () => void;
  onPlaceSelect: (placeId: string) => void;
  children: ReactNode;
};

export const AddressAutocompleteRoot = ({
  dropdownId,
  isEnabled,
  places,
  value,
  onValueChange,
  onClose,
  onPlaceSelect,
  children,
}: AddressAutocompleteRootProps) => (
  <AutocompleteRoot
    dropdownId={dropdownId}
    enabled={isEnabled}
    items={places}
    itemToStringValue={(place) => place.text}
    value={value}
    openOnValueChange={false}
    closeOnItemPress={false}
    onValueChange={(updatedValue) =>
      onValueChange(turnIntoEmptyStringIfWhitespacesOnly(updatedValue))
    }
    onClose={onClose}
  >
    {children}
    <PlaceAutocompleteSelect list={places} onChange={onPlaceSelect} />
  </AutocompleteRoot>
);
