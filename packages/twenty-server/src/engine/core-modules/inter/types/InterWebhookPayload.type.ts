import { InterChargeStatus } from 'src/engine/core-modules/inter/enums/InterChargeStatus.enum';

interface InterWebhookBase {
  codigoSolicitacao: string;
  seuNumero: string;
  situacao: InterChargeStatus;
  dataHoraSituacao: string;
  nossoNumero: string;
  txid: string;
  pixCopiaECola: string;
}

export interface InterWebhookAReceber extends InterWebhookBase {
  situacao: InterChargeStatus.A_RECEBER;
  codigoBarras: string;
  linhaDigitavel: string;
}

export interface InterWebhookRecebido extends InterWebhookBase {
  situacao: InterChargeStatus.RECEBIDO;
  valorTotalRecebido: string;
  origemRecebimento: string;
  codigoBarras: string;
  linhaDigitavel: string;
}

export type InterWebhookPayload = InterWebhookAReceber | InterWebhookRecebido;
