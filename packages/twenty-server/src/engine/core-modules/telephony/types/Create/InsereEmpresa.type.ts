export interface InsereEmpresa {
  // Required fields
  login: string;
  senha: string;
  tipo: number;
  nome: string;
  qtd_ramais_max_pabx: number;
  qtd_ramais_max_pa: number;
  salas_conf_num_max: number;
  acao_limite_espaco: number;

  // Optional fields
  email_cliente?: string;
  max_chamadas_simultaneas?: number;
  faixa_min?: number;
  faixa_max?: number;
  prefixo?: string;
  habilita_prefixo_sainte?: number;
  prefixo_sainte?: number;
  razao_social?: string;
  cnpj?: string;
  end?: string;
  compl?: string;
  cep?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  resp?: string;
  tel?: string;
  cel?: string;
  ramal_resp?: string;
  espaco_disco?: number;
  usuario_padrao_id?: number;
  cliente_bloqueado?: number;
  modulos?: string;
  cortar_prefixo_ramal?: number;
  habilitar_aviso_disco_email?: number;
  aviso_disco_email_alerta?: number;
  aviso_disco_email_urgente?: number;
  forma_arredondamento?: number;
  formato_numeros_contatos?: number;
  remover_mailings?: number;
  dias_remocao_mailings?: number;
  dias_aviso_remocao_mailings?: number;
}
