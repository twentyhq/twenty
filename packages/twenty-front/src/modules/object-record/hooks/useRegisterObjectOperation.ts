import {
  type ObjectOperationData,
  objectOperationsByObjectNameSingularFamilyState,
} from '@/object-record/states/objectOperationsByObjectNameSingularFamilyState';
import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

export const useRegisterObjectOperation = () => {
  const registerObjectOperation = useRecoilCallback(
    ({ set }) =>
      (objectNameSingular: string, data: ObjectOperationData) => {
        set(
          objectOperationsByObjectNameSingularFamilyState({
            objectNameSingular,
          }),
          (currentValue) => {
            const newValue = currentValue.concat();

            newValue.push({
              id: v4(),
              timestamp: +new Date(),
              data,
            });

            return newValue;
          },
        );
      },
    [],
  );

  return {
    registerObjectOperation,
  };
};
