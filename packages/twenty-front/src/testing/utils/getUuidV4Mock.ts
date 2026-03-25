const baseUuid = '8f3b2121-f194-4ba4-9fbf-';

export const getUuidV4Mock = () => {
  let id = 0;

  return () => {
    return baseUuid + id++;
  };
};
