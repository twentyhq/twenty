import type XLSX from 'xlsx-ugnis';

export const exceedsMaxRecords = (
  workSheet: XLSX.WorkSheet,
  maxRecords: number,
) => {
  const [top, bottom] =
    workSheet['!ref']
      ?.split(':')
      .map((position) => parseInt(position.replace(/\D/g, ''), 10)) || [];
  return bottom - top > maxRecords;
};
