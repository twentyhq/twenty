export const formatAmount = (amount: number): string => {
  // Verifica se 'amount' é um número válido antes de formatar
  if (typeof amount !== 'number' || isNaN(amount)) {
    // Retorna uma string vazia ou um valor padrão, como '0,00'
    // ou talvez lance um erro, dependendo de como o resto do app lida com isso.
    return '0,00'; // Ou '' ou outra coisa apropriada
  }

  // Cria um formatador para o locale Português (Brasil) 'pt-BR'
  // Isso garante o uso de '.' como separador de milhar e ',' como separador decimal.
  // Define para sempre mostrar 2 casas decimais.
  const formatter = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    // Se você quiser que *sempre* mostre o símbolo da moeda (R$), descomente as linhas abaixo.
    // No entanto, como o CurrencyDisplay.tsx já parece adicionar o ícone,
    // talvez você só precise da formatação numérica aqui.
    // style: 'currency',
    // currency: 'BRL',
  });

  // Formata o número usando as regras do 'pt-BR'
  return formatter.format(amount);
};
