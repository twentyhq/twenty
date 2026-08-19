// RÉGUA OFICIAL v2 (18/08/2026) — horários America/Sao_Paulo (UTC-3, sem horário de verão desde 2019).
// 9 toques em ~6 dias: 2/dia nos 3 primeiros, 1/dia depois. Concluir a FUP N cria a N+1,
// com prazo ancorado na CONCLUSÃO REAL (quem adianta, acelera; quem atrasa, reancora).
// Toque "tarde do mesmo dia" concluído após as 16h empurra para amanhã às 16h.
// Fonte da verdade compartilhada com o motor n8n "Cadência Twenty (nativa)" v10 —
// qualquer mudança de régua precisa ser aplicada nos dois até o n8n ser aposentado.

export const VITORIA_WORKSPACE_MEMBER_ID =
  '69572821-c2f4-4923-9c68-23381b665a49';
export const INBOX_URL = 'https://inbox.petbeetools.com.br/';

export const TOQUES: Record<number, string> = {
  1: 'FUP 1 (abordar agora)',
  2: 'FUP 2 (mensagem, ~1h30 depois)',
  3: 'FUP 3 (ligação + mensagem, manhã)',
  4: 'FUP 4 (ligação + mensagem, tarde)',
  5: 'FUP 5 (ligação + mensagem, manhã)',
  6: 'FUP 6 (ligação + mensagem, tarde)',
  7: 'FUP 7 (mensagem, manhã)',
  8: 'FUP 8 (ligação, tarde)',
  9: 'FUP 9 (mensagem, manhã)',
};

export const PADRAO_FUP = /^FUP (\d+|final) /;
export const PADRAO_MOTIVO = /^Preencher motivo da perda — /;
export const PADRAO_DECISAO = /^Decidir: Break ou Perdido\? — /;

const SP_OFFSET_MS = 3 * 3600000;

function spDe(instante: Date): Date {
  return new Date(instante.getTime() - SP_OFFSET_MS);
}

// Data/hora de São Paulo (dia de `base` + addDias, às hora:minuto SP) em ISO UTC.
export function horarioSP(
  base: Date,
  addDias: number,
  hora: number,
  minuto: number,
): string {
  const sp = spDe(base);

  return new Date(
    Date.UTC(
      sp.getUTCFullYear(),
      sp.getUTCMonth(),
      sp.getUTCDate() + addDias,
      hora + 3,
      minuto,
    ),
  ).toISOString();
}

// "Tarde do dia": 16h SP de hoje — a menos que já passem das 16h, aí amanhã 16h.
export function tardeDoDia(base: Date): string {
  const sp = spDe(base);

  return sp.getUTCHours() < 16
    ? horarioSP(base, 0, 16, 0)
    : horarioSP(base, 1, 16, 0);
}

export type ToqueEsperado = { titulo: string; dueAt: string };

// Próximo(s) toque(s) esperados dado o último FUP concluído, ancorado em `base`.
export function proximas(
  nome: string,
  fup: number,
  base: Date,
): ToqueEsperado[] {
  const t = (n: number): string => `${TOQUES[n]} — ${nome}`;

  if (fup <= 0) return [{ titulo: t(1), dueAt: base.toISOString() }];
  if (fup === 1)
    return [
      { titulo: t(2), dueAt: new Date(base.getTime() + 90 * 60000).toISOString() },
    ];
  if (fup === 2) return [{ titulo: t(3), dueAt: horarioSP(base, 1, 9, 30) }];
  if (fup === 3) return [{ titulo: t(4), dueAt: tardeDoDia(base) }];
  if (fup === 4) return [{ titulo: t(5), dueAt: horarioSP(base, 1, 9, 30) }];
  if (fup === 5) return [{ titulo: t(6), dueAt: tardeDoDia(base) }];
  if (fup === 6) return [{ titulo: t(7), dueAt: horarioSP(base, 1, 9, 30) }];
  if (fup === 7) return [{ titulo: t(8), dueAt: horarioSP(base, 1, 16, 0) }];
  if (fup === 8) return [{ titulo: t(9), dueAt: horarioSP(base, 1, 9, 30) }];

  return [];
}

export type Zap = { label: string; url: string; markdown: string };

// Dados de WhatsApp do negócio, prontos pros campos da task. null quando não há número usável.
export function zapDe(whatsappBruto: string | null | undefined): Zap | null {
  const bruto = String(whatsappBruto ?? '').trim();

  if (!bruto) return null;

  const digitos = bruto.replace(/\D/g, '');

  if (digitos.length < 10) return null;

  return {
    label: bruto,
    url: INBOX_URL,
    markdown: `**WhatsApp:** ${bruto} — [abrir inbox](${INBOX_URL})`,
  };
}

export function tituloDecisaoDe(nome: string): string {
  return `Decidir: Break ou Perdido? — ${nome}`;
}

export function tituloFinalDe(nome: string): string {
  return `FUP final (antes do lost) — ${nome}`;
}

export function tituloMotivoDe(nome: string): string {
  return `Preencher motivo da perda — ${nome}`;
}

export function markdownDecisao(zap: Zap | null): string {
  const corpo =
    '**9 toques feitos, sem resposta.** Decida o destino deste negócio:\n\n' +
    '- Arraste o card para **Break** → o motor agenda um FUP final em 25 dias.\n' +
    '- Arraste para **Perdido** → preencha o **motivo** (obrigatório).\n\n' +
    'Esta task some sozinha quando o card mudar de coluna.';

  return zap ? `${corpo}\n\n${zap.markdown}` : corpo;
}
