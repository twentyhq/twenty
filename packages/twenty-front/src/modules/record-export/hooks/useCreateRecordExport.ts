import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { RECORD_EXPORT_UPDATED_EVENT } from '@/record-export/constants/RecordExportUpdatedEvent';
import { useMutation } from '@apollo/client/react';
import {
  CreateRecordExportDocument,
  type CreateRecordExportInput,
} from '~/generated-metadata/graphql';

export const useCreateRecordExport = () => {
  const [createExport] = useMutation(CreateRecordExportDocument);

  const createRecordExport = async (
    input: CreateRecordExportInput,
  ): Promise<void> => {
    const { data } = await createExport({ variables: { input } });
    if (data?.createRecordExport) {
      dispatchBrowserEvent(
        RECORD_EXPORT_UPDATED_EVENT,
        data.createRecordExport,
      );
    }
  };

  return { createRecordExport };
};
