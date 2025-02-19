export const validateCnpj = (value?: string) => {
  if (!value) return true;

  const cnpjRegex = /^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})-(\d{2})$/;
  if (!cnpjRegex.test(value)) return false;

  const numeros = value.match(/\d/g)?.map(Number);
  if (!numeros) return false;

  if (new Set(numeros).size === 1) return false;

  const multiplicadores1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const multiplicadores2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const soma1 = numeros
    .slice(0, 12)
    .reduce((acc, num, idx) => acc + num * multiplicadores1[idx], 0);
  let resto = soma1 % 11;
  const digito1 = resto < 2 ? 0 : 11 - resto;

  if (digito1 !== numeros[12]) return false;

  const soma2 = numeros
    .slice(0, 13)
    .reduce((acc, num, idx) => acc + num * multiplicadores2[idx], 0);
  resto = soma2 % 11;
  const digito2 = resto < 2 ? 0 : 11 - resto;

  if (digito2 !== numeros[13]) return false;

  return true;
};
