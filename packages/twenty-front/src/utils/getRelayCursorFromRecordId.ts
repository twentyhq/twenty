export const getRelayCursorFromRecordId = (recordId: string) => {
  return btoa(`[1, "${recordId}"]`);
};
