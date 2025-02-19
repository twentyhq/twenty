const isCnpj = (data: string | null | undefined) => {
  if (data !== null && data !== undefined) return data.length === 14;
  return false;
};

export default isCnpj;
