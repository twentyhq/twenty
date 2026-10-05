import { useStore } from 'jotai';
import { type RefObject } from 'react';

import { SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID } from '@/geo-map/constants/SelectAutocompleteListDropDownId';
import { SELECT_COUNTRY_DROPDOWN_ID } from '@/ui/input/components/internal/country/constants/SelectCountryDropdownId';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

const ADDRESS_CLICK_OUTSIDE_LISTENER_ID = 'address-input';

const ADDRESS_DROPDOWN_IDS = [
  SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID,
  SELECT_COUNTRY_DROPDOWN_ID,
];

type UseAddressInputClickOutsideArgs = {
  inputRef: RefObject<HTMLDivElement | null>;
  onClickOutside: (event: MouseEvent | TouchEvent) => void;
};

export const useAddressInputClickOutside = ({
  inputRef,
  onClickOutside,
}: UseAddressInputClickOutsideArgs) => {
  const store = useStore();

  useListenClickOutside({
    refs: [inputRef],
    callback: (event) => {
      const isAddressDropdownOpen = ADDRESS_DROPDOWN_IDS.some((dropdownId) =>
        store.get(
          isDropdownOpenComponentState.atomFamily({ instanceId: dropdownId }),
        ),
      );

      if (isAddressDropdownOpen) {
        return;
      }

      event.stopImmediatePropagation();
      onClickOutside(event);
    },
    listenerId: ADDRESS_CLICK_OUTSIDE_LISTENER_ID,
  });
};
