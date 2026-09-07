import { StyledComposerTextInput } from '@/activities/components/ComposerTextInput';
import { PlaceAutocompleteSelect } from '@/geo-map/components/PlaceAutocompleteSelect';
import { usePlaceAutocomplete } from '@/geo-map/hooks/usePlaceAutocomplete';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { isDefined } from 'twenty-shared/utils';

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
    <Dropdown
      dropdownId={CALENDAR_EVENT_LOCATION_AUTOCOMPLETE_DROPDOWN_ID}
      dropdownPlacement="bottom-start"
      clickableComponentWidth="100%"
      disableClickForClickableComponent
      onClickOutside={closePlaceAutocomplete}
      clickableComponent={
        <StyledComposerTextInput
          type="text"
          autoComplete="off"
          aria-label={ariaLabel}
          placeholder={placeholder}
          value={value}
          onChange={(event) => handleLocationChange(event.target.value)}
        />
      }
      dropdownComponents={
        <PlaceAutocompleteSelect
          list={placeAutocompleteData}
          onChange={handlePlaceSelection}
          dropdownId={CALENDAR_EVENT_LOCATION_AUTOCOMPLETE_DROPDOWN_ID}
        />
      }
    />
  );
};
