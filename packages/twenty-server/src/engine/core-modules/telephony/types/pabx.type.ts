export type ListExtentionsArgs = Partial<{
  numero: string;
  cliente_id?: number;
}>;

export interface ListCommonArgs {
  pos_registro_inicial?: number;
  cliente_id: number;
}
