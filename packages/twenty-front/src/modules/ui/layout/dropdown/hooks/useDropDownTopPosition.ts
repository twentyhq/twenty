import { useEffect, useRef, useState } from 'react';
import { isDefined } from '~/utils/isDefined';

export const useDropDownTopPosition = () => {
  const [top, setTop] = useState<number | undefined>(undefined);
  // eslint-disable-next-line @nx/workspace-no-state-useref
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isDefined(dropdownRef.current)) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setTop(rect.top);
    }
  }, [dropdownRef]);

  return { dropDownTopPosition: top, dropdownRef };
};
