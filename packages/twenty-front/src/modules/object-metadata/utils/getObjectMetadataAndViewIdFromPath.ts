const GET_OBJECT_VIEWID_PLURAL_NAME = /\/objects\/([^\/?]+)(?:\?view=([^&]+))?/;

export const getObjectAndViewIdFromPath = (path: string) => {
  const result = String(path).match(
    GET_OBJECT_VIEWID_PLURAL_NAME,
  ) as RegExpMatchArray;
  return {
    objectMetadataId: result[1],
    viewId: result[2],
  };
};
