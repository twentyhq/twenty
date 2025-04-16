import { Field, ID, InputType, Int } from '@nestjs/graphql';

import { IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateTelephonyInput {
  @Field(() => ID, { nullable: true })
  @IsString()
  memberId: string;

  @Field(() => ID)
  @IsString()
  workspaceId: string;

  @Field(() => ID)
  @IsString()
  numberExtension: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  type?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  extensionName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  extensionGroup?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  dialingPlan?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  areaCode?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  SIPPassword?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  callerExternalID?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  pullCalls?: string;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  listenToCalls?: boolean;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  recordCalls?: boolean;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  blockExtension?: boolean;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  enableMailbox?: boolean;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  emailForMailbox?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  fowardAllCalls?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  fowardBusyNotAvailable?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  fowardOfflineWithoutService?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  extensionAllCallsOrOffline?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  externalNumberAllCallsOrOffline?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  destinyMailboxAllCallsOrOffline?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  extensionBusy?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  externalNumberBusy?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  destinyMailboxBusy?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  ramal_id?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  advancedFowarding1?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  advancedFowarding2?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  advancedFowarding3?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  advancedFowarding4?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  advancedFowarding5?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  advancedFowarding1Value?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  advancedFowarding2Value?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  advancedFowarding3Value?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  advancedFowarding4Value?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  advancedFowarding5Value?: string;
}

@InputType()
export class UpdateTelephonyInput {
  @Field(() => ID, { nullable: true })
  memberId?: string;

  @Field(() => ID)
  numberExtension?: string;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  extensionName?: string;

  @Field({ nullable: true })
  extensionGroup?: string;

  @Field({ nullable: true })
  dialingPlan?: string;

  @Field({ nullable: true })
  areaCode?: string;

  @Field({ nullable: true })
  SIPPassword?: string;

  @Field({ nullable: true })
  callerExternalID?: string;

  @Field({ nullable: true })
  pullCalls?: string;

  @Field({ nullable: true })
  listenToCalls?: boolean;

  @Field({ nullable: true })
  recordCalls?: boolean;

  @Field({ nullable: true })
  blockExtension?: boolean;

  @Field({ nullable: true })
  enableMailbox?: boolean;

  @Field({ nullable: true })
  emailForMailbox?: string;

  @Field({ nullable: true })
  fowardAllCalls?: string;

  @Field({ nullable: true })
  fowardBusyNotAvailable?: string;

  @Field({ nullable: true })
  fowardOfflineWithoutService?: string;

  @Field({ nullable: true })
  extensionAllCallsOrOffline?: string;

  @Field({ nullable: true })
  externalNumberAllCallsOrOffline?: string;

  @Field({ nullable: true })
  destinyMailboxAllCallsOrOffline?: string;

  @Field({ nullable: true })
  extensionBusy?: string;

  @Field({ nullable: true })
  externalNumberBusy?: string;

  @Field({ nullable: true })
  destinyMailboxBusy?: string;

  @Field({ nullable: true })
  ramal_id?: string;

  @Field({ nullable: true })
  advancedFowarding1?: string;

  @Field({ nullable: true })
  advancedFowarding2?: string;

  @Field({ nullable: true })
  advancedFowarding3?: string;

  @Field({ nullable: true })
  advancedFowarding4?: string;

  @Field({ nullable: true })
  advancedFowarding5?: string;

  @Field({ nullable: true })
  advancedFowarding1Value?: string;

  @Field({ nullable: true })
  advancedFowarding2Value?: string;

  @Field({ nullable: true })
  advancedFowarding3Value?: string;

  @Field({ nullable: true })
  advancedFowarding4Value?: string;

  @Field({ nullable: true })
  advancedFowarding5Value?: string;
}

@InputType()
export class CreatePabxCompanyInput {
  @Field()
  @IsString()
  login: string;

  @Field()
  @IsString()
  senha: string;

  @Field(() => Int)
  @IsNumber()
  tipo: number;

  @Field()
  @IsString()
  nome: string;

  @Field(() => Int)
  @IsNumber()
  qtd_ramais_max_pabx: number;

  @Field(() => Int)
  @IsNumber()
  qtd_ramais_max_pa: number;

  @Field(() => Int)
  @IsNumber()
  salas_conf_num_max: number;

  @Field(() => Int)
  @IsNumber()
  acao_limite_espaco: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  email_cliente?: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  max_chamadas_simultaneas?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  faixa_min?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  faixa_max?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  prefixo?: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  habilita_prefixo_sainte?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  prefixo_sainte?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  razao_social?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  cnpj?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  end?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  compl?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  cep?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  bairro?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  cidade?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  estado?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  resp?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  tel?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  cel?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  ramal_resp?: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  espaco_disco?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  usuario_padrao_id?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  cliente_bloqueado?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  modulos?: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  cortar_prefixo_ramal?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  habilitar_aviso_disco_email?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  aviso_disco_email_alerta?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  aviso_disco_email_urgente?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  forma_arredondamento?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  formato_numeros_contatos?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  remover_mailings?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  dias_remocao_mailings?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  dias_aviso_remocao_mailings?: number;
}
