import { useEffect } from 'react';
import { useDropdownPage } from 'twenty-ui/components/navigation';

type MultipleRecordPickerSearchEffectProps = {
  cancelSearch: () => void;
};

export const MultipleRecordPickerSearchEffect = ({
  cancelSearch,
}: MultipleRecordPickerSearchEffectProps) => {
  const { isActive } = useDropdownPage();

  useEffect(() => {
    if (!isActive) {
      cancelSearch();
    }

    return cancelSearch;
  }, [cancelSearch, isActive]);

  return null;
};
