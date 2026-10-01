import { atom, useStore } from 'jotai';
import { type RefObject, useEffect, useState } from 'react';

import { SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID } from '@/geo-map/constants/SelectAutocompleteListDropDownId';
import { isClickFromPointerDown } from '@/ui/field/input/utils/isClickFromPointerDown';
import { SELECT_COUNTRY_DROPDOWN_ID } from '@/ui/input/components/internal/country/constants/SelectCountryDropdownId';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

const POINTER_DOWN_EVENT_NAME = 'pointerdown';
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
  const [pointerDownAtom] = useState(() =>
    atom<{
      target: EventTarget | null;
      wasDropdownOpen: boolean;
    } | null>(null),
  );

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      store.set(pointerDownAtom, {
        target: event.target,
        wasDropdownOpen: ADDRESS_DROPDOWN_IDS.some((dropdownId) =>
          store.get(
            isDropdownOpenComponentState.atomFamily({ instanceId: dropdownId }),
          ),
        ),
      });
    };

    window.addEventListener(POINTER_DOWN_EVENT_NAME, handlePointerDown, {
      capture: true,
    });

    return () => {
      window.removeEventListener(POINTER_DOWN_EVENT_NAME, handlePointerDown, {
        capture: true,
      });
    };
  }, [pointerDownAtom, store]);

  useListenClickOutside({
    refs: [inputRef],
    callback: (event) => {
      const pointerDown = store.get(pointerDownAtom);
      const wasDropdownOpenOnPointerDown =
        pointerDown?.wasDropdownOpen &&
        isClickFromPointerDown({
          clickTarget: event.target,
          pointerDownTarget: pointerDown.target,
        });
      store.set(pointerDownAtom, null);

      const isDropdownOpen = ADDRESS_DROPDOWN_IDS.some((dropdownId) =>
        store.get(
          isDropdownOpenComponentState.atomFamily({ instanceId: dropdownId }),
        ),
      );

      if (wasDropdownOpenOnPointerDown || isDropdownOpen) {
        return;
      }

      event.stopImmediatePropagation();
      onClickOutside(event);
    },
    listenerId: ADDRESS_CLICK_OUTSIDE_LISTENER_ID,
  });
};
