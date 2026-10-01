import { StyledComposerTextInput } from '@/activities/components/ComposerTextInput';
import { PlaceAutocompleteSelect } from '@/geo-map/components/PlaceAutocompleteSelect';
import { usePlaceAutocomplete } from '@/geo-map/hooks/usePlaceAutocomplete';
import { AutocompleteRoot } from '@/ui/input/components/AutocompleteRoot';
import { Autocomplete } from 'twenty-ui/primitives/input';
import { isDefined } from 'twenty-shared/utils';
import { createElement } from 'react';

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
      filter={null}
      autoHighlight="always"
      value={value}
      onValueChange={(location, details) => {
        if (
          details.reason === 'escape-key' ||
          details.reason === 'item-press'
        ) {
          return;
        }

        handleLocationChange(location);
      }}
      onOpenChange={(open, details) => {
        if (open && details.reason === 'input-change') {
          details.cancel();
          return;
        }

        if (!open) {
          closePlaceAutocomplete();
        }
      }}
    >
      <Autocomplete.Input
        aria-label={ariaLabel}
        placeholder={placeholder}
        render={(inputProps) =>
          createElement(StyledComposerTextInput, {
            ...inputProps,
            className: undefined,
            type: 'text',
            autoComplete: 'off',
          })
        }
      />
      <PlaceAutocompleteSelect
        list={placeAutocompleteData}
        onChange={handlePlaceSelection}
      />
    </AutocompleteRoot>
  );
};
