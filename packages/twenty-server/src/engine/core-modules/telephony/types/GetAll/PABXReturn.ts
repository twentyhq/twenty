export interface TelephonyExtension {
  ramal_id: string;
  cliente_id: string;
  nome: string;
  tipo: string;
  usuario_autenticacao: string;
  numero: string;
  senha_sip: string;
  senha_web: string;
  caller_id_externo: string;
  grupo_ramais: string;
  centro_custo: string;
  plano_discagem_id: string;
  grupo_musica_espera: string | null;
  puxar_chamadas: string;
  habilitar_timers: string;
  habilitar_blf: string;
  escutar_chamadas: string;
  gravar_chamadas: string;
  bloquear_ramal: string;
  codigo_incorporacao: string;
  codigo_area: string;
  habilitar_dupla_autenticacao: string;
  dupla_autenticacao_ip_permitido: string;
  dupla_autenticacao_mascara: string;
  encaminhar_todas_chamadas: Encaminhamento;
  encaminhar_offline_sem_atendimento: Encaminhamento;
  encaminhar_ocupado_indisponivel: Encaminhamento;
}

export interface Encaminhamento {
  encaminhamento_tipo: string;
  encaminhamento_destino: string[];
  encaminhamento_destinos: string[];
}
