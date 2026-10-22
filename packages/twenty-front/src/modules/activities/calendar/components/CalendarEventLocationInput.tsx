import { PlaceAutocompleteSelect } from '@/geo-map/components/PlaceAutocompleteSelect';
import { usePlaceAutocomplete } from '@/geo-map/hooks/usePlaceAutocomplete';
import { AutocompleteRoot } from '@/ui/input/components/AutocompleteRoot';
import { isDefined } from 'twenty-shared/utils';
import { Autocomplete, Input } from 'twenty-ui/primitives/input';

const CALENDAR_EVENT_LOCATION_AUTOCOMPLETE_DROPDOWN_ID =
  'calendar-event-location-autocomplete-dropdown';

type CalendarEventLocationInputProps = {
  ariaLabel: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export const CalendarEventLocationInput = ({
  ariaLabel,
  placeholder,
  value,
  onChange,
}: CalendarEventLocationInputProps) => {
  const {
    placeAutocompleteData,
    getAutocompletePlaceData,
    closePlaceAutocomplete,
    resetPlaceAutocomplete,
  } = usePlaceAutocomplete(CALENDAR_EVENT_LOCATION_AUTOCOMPLETE_DROPDOWN_ID);

  const handleLocationChange = (location: string) => {
    onChange(location);
    getAutocompletePlaceData({ address: location });
  };

  const handlePlaceSelection = (placeId: string) => {
    const selectedPlace = placeAutocompleteData.find(
      (place) => place.placeId === placeId,
    );

    if (!isDefined(selectedPlace)) {
      return;
    }

    onChange(selectedPlace.text);
    resetPlaceAutocomplete();
  };

  return (
    <AutocompleteRoot
      dropdownId={CALENDAR_EVENT_LOCATION_AUTOCOMPLETE_DROPDOWN_ID}
      items={placeAutocompleteData}
      itemToStringValue={(place) => place.text}
      value={value}
      openOnValueChange={false}
      onValueChange={handleLocationChange}
      onClose={closePlaceAutocomplete}
    >
      <Autocomplete.Input
        type="text"
        autoComplete="off"
        aria-label={ariaLabel}
        placeholder={placeholder}
        render={<Input variant="plain" />}
      />
      <PlaceAutocompleteSelect
        list={placeAutocompleteData}
        onChange={handlePlaceSelection}
      />
    </AutocompleteRoot>
  );
};
