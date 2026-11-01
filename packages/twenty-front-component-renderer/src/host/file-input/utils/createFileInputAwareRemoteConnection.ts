import { type RemoteConnection } from '@remote-dom/core/elements';

import { FILE_INPUT_PICKER_METHOD } from '@/constants/FileInputPickerMethod';
import { type FileInputHost } from '@/host/file-input/types/FileInputHost';

export const createFileInputAwareRemoteConnection = ({
  connection,
  fileInputHost,
}: {
  connection: RemoteConnection;
  fileInputHost: FileInputHost;
}): RemoteConnection => ({
  mutate: connection.mutate,
  call: (remoteElementId, methodName, ...methodArguments) => {
    if (methodName === FILE_INPUT_PICKER_METHOD) {
      fileInputHost.openFilePicker(remoteElementId);
      return;
    }

    return connection.call(remoteElementId, methodName, ...methodArguments);
  },
});
