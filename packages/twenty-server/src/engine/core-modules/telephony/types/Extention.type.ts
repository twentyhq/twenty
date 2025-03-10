export type ExtetionBody = {
  dados: {
    tipo: number;
    nome: string | undefined;
    numero: string | undefined;
    senha_sip: string | undefined;
    caller_id_externo: string | undefined;
    cliente_id: number;
    grupo_ramais: string;
    centro_custo: string;
    dupla_autenticacao_ip_permitido: string;
    dupla_autenticacao_mascara: string;
    grupo_musica_espera: string;
    plano_discagem_id: number;
    puxar_chamadas: number;
    habilitar_timers: number;
    habilitar_blf: number;
    escutar_chamadas: number;
    gravar_chamadas: number;
    bloquear_ramal: number;
    codigo_area: number;
    habilitar_dupla_autenticacao: number;
    habilitar_caixa_postal: number;
    caixa_postal_email: string | undefined;
    encaminhar_todas_chamadas: {
      encaminhamento_tipo: number;
      encaminhamento_destino: string | undefined;
      encaminhamento_destinos: {
        encaminhamento_tipo: number;
        encaminhamento_destino: string;
      }[];
    };
    encaminhar_offline_sem_atendimento: {
      encaminhamento_tipo: number;
      encaminhamento_destino: string | undefined;
    };
    encaminhar_ocupado_indisponivel: {
      encaminhamento_tipo: number;
      encaminhamento_destino: string | undefined;
    };
  };
};
