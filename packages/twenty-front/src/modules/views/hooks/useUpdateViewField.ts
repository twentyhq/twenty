import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { ViewField } from '@/views/types/ViewField';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-ui';

export const useUpdateViewField = () => {
  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.ViewField,
  });

  const updateViewField = useRecoilCallback(
    () => async (viewField: Partial<ViewField>) => {
      if (isDefined(viewField.id)) {
        await updateOneRecord({
          idToUpdate: viewField.id,
          updateOneRecordInput: viewField,
        });
      }
    },
    [updateOneRecord],
  );

  return {
    updateViewField,
  };
};
