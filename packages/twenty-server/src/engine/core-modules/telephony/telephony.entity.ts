import { Field, ID, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'telephony', schema: 'core' })
@ObjectType('Telephony')
export class Telephony {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ default: '', nullable: false, unique: true })
  memberId: string;

  @Field()
  @Column({ default: '', nullable: false, unique: true })
  numberExtension: string;

  @Field(() => Workspace)
  @ManyToOne(() => Workspace)
  workspace: Relation<Workspace>;

  @Field()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  type: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  extensionName: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  extensionGroup: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  dialingPlan: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  areaCode: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  SIPPassword: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  callerExternalID: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  pullCalls: string;

  @Field({ nullable: true })
  @Column({ default: false, nullable: true })
  listenToCalls: boolean;

  @Field({ nullable: true })
  @Column({ default: false, nullable: true })
  recordCalls: boolean;

  @Field({ nullable: true })
  @Column({ default: false, nullable: true })
  blockExtension: boolean;

  @Field({ nullable: true })
  @Column({ default: false, nullable: true })
  enableMailbox: boolean;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  emailForMailbox: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  fowardAllCalls: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  fowardBusyNotAvailable: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  fowardOfflineWithoutService: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  extensionAllCallsOrOffline: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  externalNumberAllCallsOrOffline: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  destinyMailboxAllCallsOrOffline: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  extensionBusy: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  externalNumberBusy: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  destinyMailboxBusy: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  ramal_id: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  advancedFowarding1: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  advancedFowarding2: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  advancedFowarding3: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  advancedFowarding4: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  advancedFowarding5: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  advancedFowarding1Value: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  advancedFowarding2Value: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  advancedFowarding3Value: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  advancedFowarding4Value: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  advancedFowarding5Value: string;
}

@ObjectType()
class Encaminhamento {
  @Field({ nullable: true })
  encaminhamento_tipo?: string;

  @Field(() => [String], { nullable: true })
  encaminhamento_destino?: string[];

  @Field(() => [String], { nullable: true })
  encaminhamento_destinos?: string[];
}

@ObjectType()
export class TelephonyExtension {
  @Field(() => ID, { nullable: true })
  ramal_id?: string;

  @Field({ nullable: true })
  cliente_id?: string;

  @Field({ nullable: true })
  nome?: string;

  @Field({ nullable: true })
  tipo?: string;

  @Field({ nullable: true })
  usuario_autenticacao?: string;

  @Field({ nullable: true })
  numero?: string;

  @Field({ nullable: true })
  senha_sip?: string;

  @Field({ nullable: true })
  senha_web?: string;

  @Field({ nullable: true })
  caller_id_externo?: string;

  @Field({ nullable: true })
  grupo_ramais?: string;

  @Field({ nullable: true })
  centro_custo?: string;

  @Field({ nullable: true })
  plano_discagem_id?: string;

  @Field({ nullable: true })
  grupo_musica_espera?: string;

  @Field({ nullable: true })
  puxar_chamadas?: string;

  @Field({ nullable: true })
  habilitar_timers?: string;

  @Field({ nullable: true })
  habilitar_blf?: string;

  @Field({ nullable: true })
  escutar_chamadas?: string;

  @Field({ nullable: true })
  gravar_chamadas?: string;

  @Field({ nullable: true })
  bloquear_ramal?: string;

  @Field({ nullable: true })
  codigo_incorporacao?: string;

  @Field({ nullable: true })
  codigo_area?: string;

  @Field({ nullable: true })
  habilitar_dupla_autenticacao?: string;

  @Field({ nullable: true })
  dupla_autenticacao_ip_permitido?: string;

  @Field({ nullable: true })
  dupla_autenticacao_mascara?: string;

  @Field(() => Encaminhamento, { nullable: true })
  encaminhar_todas_chamadas?: Encaminhamento;

  @Field(() => Encaminhamento, { nullable: true })
  encaminhar_offline_sem_atendimento?: Encaminhamento;

  @Field(() => Encaminhamento, { nullable: true })
  encaminhar_ocupado_indisponivel?: Encaminhamento;
}

@ObjectType()
export class TelephonyDialingPlan {
  @Field(() => ID, { nullable: true })
  plano_discagem_id?: string;

  @Field({ nullable: true })
  nome?: string;

  @Field({ nullable: true })
  cliente_id?: string;
}

@ObjectType()
export class TelephonyDids {
  @Field(() => ID, { nullable: true })
  did_id?: string;

  @Field({ nullable: true })
  cliente_id?: string;

  @Field({ nullable: true })
  numero?: string;

  @Field({ nullable: true })
  apontar_para?: string;

  @Field({ nullable: true })
  destino?: string;

  @Field({ nullable: true })
  habilitar_registro?: string;

  @Field({ nullable: true })
  registro_dominio?: string;

  @Field({ nullable: true })
  registro_usuario?: string;

  @Field({ nullable: true })
  registro_senha?: string;

  @Field({ nullable: true })
  gravar_chamadas?: string;

  @Field({ nullable: true })
  maximo_chamadas_simultaneas?: string;

  @Field({ nullable: true })
  habilitar_horario_funcionamento?: string;

  @Field({ nullable: true })
  horario_funcionamento_inicio?: string;

  @Field({ nullable: true })
  horario_funcionamento_fim?: string;

  @Field(() => [String], { nullable: true })
  horario_funcionamento_dias_semana?: string[];

  @Field(() => [String], { nullable: true })
  horario_funcionamento_lista_feriados?: string[];
}

@ObjectType()
export class Campaign {
  @Field(() => ID, { nullable: true })
  campanha_id?: string;

  @Field({ nullable: true })
  cliente_id?: string;

  @Field({ nullable: true })
  nome?: string;
}

@ObjectType()
export class TelephonyCallFlow {
  @Field(() => ID, { nullable: true })
  fluxo_chamada_id?: string;

  @Field({ nullable: true })
  fluxo_chamada_nome?: string;
}
