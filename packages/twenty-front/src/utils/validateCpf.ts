export const validateCpf = (value?: string) => {
  if (!value) return true;

  const cpfRegex = /^(?:(\d{3}).(\d{3}).(\d{3})-(\d{2}))$/;
  if (!cpfRegex.test(value)) return false;

  const numeros = value.match(/\d/g)?.map(Number);
  if (!numeros) return false;

  if (new Set(numeros).size === 1) return false;

  let soma = numeros.reduce((acc, cur, idx) => {
    if (idx < 9) {
      return acc + cur * (10 - idx);
    }
    return acc;
  }, 0);

  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) {
    resto = 0;
  }
  if (resto !== numeros[9]) return false;

  soma = numeros.reduce((acc, cur, idx) => {
    if (idx < 10) {
      return acc + cur * (11 - idx);
    }
    return acc;
  }, 0);

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) {
    resto = 0;
  }
  if (resto !== numeros[10]) return false;

  return true;
};
