import { type PlaceAutocompleteResult } from '@/geo-map/types/PlaceApi';
import { Tag } from 'twenty-ui/primitives/data-display';
import { Autocomplete } from 'twenty-ui/primitives/input';

type PlaceAutocompleteSelectProps = {
  list: PlaceAutocompleteResult[];
  onChange: (placeId: string) => void;
};

export const PlaceAutocompleteSelect = ({
  list,
  onChange,
}: PlaceAutocompleteSelectProps) => (
  <Autocomplete.Popup width={345}>
    <Autocomplete.List>
      {list.map((place) => (
        <Autocomplete.Item
          key={place.placeId}
          value={place}
          onClick={() => onChange(place.placeId)}
        >
          <Tag color="transparent" borderStyle="dashed" variant="soft">
            {place.text}
          </Tag>
        </Autocomplete.Item>
      ))}
    </Autocomplete.List>
  </Autocomplete.Popup>
);
