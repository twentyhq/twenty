import { SectorTopic } from '@/settings/service-center/sectors/types/SectorTopic';
import { useMemo } from 'react';
import { v4 } from 'uuid';

export const DEFAULT_OPTION: SectorTopic = {
  color: 'green',
  id: v4(),
  label: 'Topic 1',
  position: 0,
  value: 'Topic 1',
};

export const useSelectSettingsFormInitialValues = () => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const defaultList = [DEFAULT_OPTION];

  const initialOptions = useMemo(
    () =>
      defaultList.length
        ? [...defaultList].sort(
            (optionA, optionB) => optionA.position - optionB.position,
          )
        : [DEFAULT_OPTION],
    [defaultList],
  );

  return {
    initialOptions,
    DEFAULT_OPTION,
  };
};
