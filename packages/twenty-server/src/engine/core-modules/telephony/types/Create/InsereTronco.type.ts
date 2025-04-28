export interface TarifaTronco {
  regiao_id: number;
  tarifa: number;
  fracionamento: string;
}

export interface InsereTronco {
  // Required fields
  tronco_id: number;
  nome: string;
  endereco: string;
  cliente_id: number;

  // Optional fields
  host_dinamico?: number;
  qtd_digitos_cortados?: number;
  insere_digitos?: string;
  autentica_user_pass?: number;
  usuario?: string;
  senha?: string;
  tarifas?: TarifaTronco[];
}
