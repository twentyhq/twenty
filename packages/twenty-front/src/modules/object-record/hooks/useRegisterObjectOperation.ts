import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  objectOperationsState,
  type ObjectOperationData,
} from '@/object-record/states/objectOperationsComponentState';
import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

export const useRegisterObjectOperation = () => {
  const registerObjectOperation = useRecoilCallback(
    ({ set }) =>
      (objectMetadataItem: ObjectMetadataItem, data: ObjectOperationData) => {
        set(objectOperationsState, (currentValue) => {
          const newValue = currentValue.concat();

          newValue.push({
            id: v4(),
            timestamp: +new Date(),
            objectMetadataItemId: objectMetadataItem.id,
            data,
          });

          return newValue;
        });
      },
    [],
  );

  return {
    registerObjectOperation,
  };
};
