export type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};
export type AddressFields = {
  street?: string;
  state?: string;
  postcode?: string;
  city?: string;
  country?: string;
  location?: locationFields;
};
export type locationFields = {
  lat?: number;
  lng?: number;
};
export const sanitizePlaceDetailsResults = (
  AddressComponents: AddressComponent[],
  location?: locationFields,
): AddressFields => {
  if (!AddressComponents || AddressComponents.length === 0) return {};

  const address: AddressFields = {};
  let streetNumber: string | undefined;
  let route: string | undefined;

  for (const AddressComponent of AddressComponents) {
    for (const type of AddressComponent.types) {
      switch (type) {
        case 'street_number': {
          streetNumber = AddressComponent.long_name;
          break;
        }

        case 'route': {
          route = AddressComponent.long_name;
          break;
        }

        case 'postal_code': {
          address.postcode =
            AddressComponent.long_name + (address.postcode ?? '');
          break;
        }

        case 'postal_code_suffix': {
          address.postcode =
            (address.postcode ?? '') + '-' + AddressComponent.long_name;
          break;
        }

        case 'locality':
          address.city = AddressComponent.long_name;
          break;

        case 'postal_town':
          if (!address.city) {
            address.city = AddressComponent.long_name;
          }
          break;

        case 'administrative_area_level_3': {
          if (!address.city) {
            address.city = AddressComponent.long_name;
          }
          break;
        }

        case 'administrative_area_level_1': {
          address.state = AddressComponent.long_name;
          break;
        }

        case 'administrative_area_level_2': {
          if (!address.state) {
            address.state = AddressComponent.long_name;
          }
          break;
        }

        case 'country':
          address.country = AddressComponent.short_name;
          break;
      }
    }
  }

  address.street = [streetNumber, route].filter(Boolean).join(' ') || undefined;
  address.location = location;

  return address;
};
