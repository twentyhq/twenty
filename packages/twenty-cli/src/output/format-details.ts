import { dimText } from '@/output/style';

export const formatDetails = (rows: [label: string, value: string][]) => {
  const labelWidth = Math.max(...rows.map(([label]) => label.length));

  return rows
    .map(([label, value]) => `${dimText(label.padEnd(labelWidth))}   ${value}`)
    .join('\n');
};
