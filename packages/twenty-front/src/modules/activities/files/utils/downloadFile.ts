import { saveAs } from 'file-saver';
import { t } from '@lingui/core/macro';

export const downloadFile = (fullPath: string, fileName: string) => {
  return fetch(fullPath)
    .then((resp) =>
      resp.status === 200
        ? resp.blob()
        : Promise.reject(t`Failed downloading file`),
    )
    .then((blob) => {
      saveAs(blob, fileName);
    });
};
