import { saveAs } from 'file-saver';

export const downloadFile = (fullPath: string, fileName: string) => {
  fetch(fullPath)
    .then((resp) =>
      resp.status === 200
        ? resp.blob()
        : Promise.reject('Failed downloading file'),
    )
    .then((blob) => {
      saveAs(blob, fileName);
    });
};
