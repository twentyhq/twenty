import { saveAs } from 'file-saver';
import { getFileAbsoluteURI } from '~/utils/file/getFileAbsoluteURI';

export const downloadFile = (fullPath: string, fileName: string) => {
  fetch(getFileAbsoluteURI(fullPath))
    .then((resp) =>
      resp.status === 200
        ? resp.blob()
        : Promise.reject('Failed downloading file'),
    )
    .then((blob) => {
      saveAs(blob, fileName);
    });
};
