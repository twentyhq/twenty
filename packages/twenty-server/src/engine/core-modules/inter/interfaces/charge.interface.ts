import { registerEnumType } from '@nestjs/graphql';

import { HttpStatusCode } from 'axios';

export enum InterCustomerType {
  FISICA = 'FISICA',
  JURIDICA = 'JURIDICA',
}

registerEnumType(InterCustomerType, {
  name: 'InterCustomerType',
  description: 'Tipos de pessoa para o cliente Inter',
});

export enum InterCustomerUf {
  AC = 'AC',
  AL = 'AL',
  AP = 'AP',
  AM = 'AM',
  BA = 'BA',
  CE = 'CE',
  DF = 'DF',
  ES = 'ES',
  GO = 'GO',
  MA = 'MA',
  MT = 'MT',
  MS = 'MS',
  MG = 'MG',
  PA = 'PA',
  PB = 'PB',
  PR = 'PR',
  PE = 'PE',
  PI = 'PI',
  RJ = 'RJ',
  RN = 'RN',
  RS = 'RS',
  RO = 'RO',
  RR = 'RR',
  SC = 'SC',
  SP = 'SP',
  SE = 'SE',
  TO = 'TO',
}

registerEnumType(InterCustomerUf, {
  name: 'InterCustomerUf',
  description: 'Estados brasileiros para o cliente Inter',
});

export interface InterCustomer {
  cpfCnpj: string;
  tipoPessoa: InterCustomerType;
  nome: string;
  endereco: string;
  cidade: string;
  uf: InterCustomerUf;
  cep: string;
  bairro?: string;
  email?: string;
  ddd?: string;
  telefone?: string;
  numero?: string;
  complemento?: string;
}

export interface InterChargeDiscount {
  codigo: 'VALORFIXODATAINFORMADA' | 'PERCENTUALDATAINFORMADA';
  valor?: string;
  taxa?: number;
  quantidadeDias: number;
}

export interface InterChargeFine {
  codigo: 'PERCENTUAL' | 'VALORFIXO';
  taxa?: string;
  valor?: string;
}

export interface InterChargeLatePayment {
  codigo: 'TAXAMENSAL' | 'VALORDIA';
  valor?: string;
  taxa?: string;
}

export enum InterChargeReceipotType {
  'BOLETO' = 'BOLETO',
  'PIX' = 'PIX',
}

export interface InterChargeRequest {
  seuNumero: string;
  valorNominal: string;
  dataVencimento: string;
  numDiasAgenda: string;
  pagador: InterCustomer;
  desconto?: InterChargeDiscount;
  multa?: InterChargeFine;
  mora?: InterChargeLatePayment;
  menssagem?: string[];
  bbeneficiárioFinal?: Omit<
    InterCustomer,
    'email' | 'telefone' | 'ddd' | 'complemento' | 'numero'
  >;
  formasRecebimento?: InterChargeReceipotType[];
}

export interface InterChargeResponse {
  codigoSolicitacao: string;
}

export interface InterChargeErrorResponse {
  title: string;
  detail: string;
  status?: HttpStatusCode;
  timestamp?: string;
  violacoes?: Array<{
    razao?: string;
    propriedade?: string;
  }>;
}
