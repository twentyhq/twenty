import {
  type ObjectOperationData,
  objectOperationsByObjectNameSingularFamilyState,
} from '@/object-record/states/objectOperationsByObjectNameSingularFamilyState';
import { useRecoilCallback } from 'recoil';

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
              id: crypto.randomUUID(),
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
