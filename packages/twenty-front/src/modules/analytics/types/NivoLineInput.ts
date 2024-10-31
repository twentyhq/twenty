export type NivoLineInput = {
  id: string | number;
  color?: string;
  data: Array<{
    x: number | string | Date;
    y: number | string | Date;
  }>;
};
