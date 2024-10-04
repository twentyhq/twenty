import { getFileAbsoluteURI } from '~/utils/file/getFileAbsoluteURI';

export const downloadFile = (fullPath: string, fileName: string) => {
  fetch(getFileAbsoluteURI(fullPath))
    .then((resp) =>
      resp.status === 200
        ? resp.blob()
        : Promise.reject('Failed downloading file'),
    )
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    });
};
