export const formatCEP = (value: string): string => {
  return value
    ? value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1-$2')
        .replace(/(-\d{3})\d+$/, '$1')
    : '';
};
