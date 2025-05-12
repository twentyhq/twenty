import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@Entity({ name: 'onboardingPlans', schema: 'core' })
@ObjectType('OnboardingPlans')
export class OnboardingPlans {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'text' })
  title: string;

  @Field()
  @Column({ type: 'integer' }) // armazenado em centavos
  price: number;

  @Field()
  @Column({ type: 'text' })
  type: string;

  @Field(() => [String])
  @Column('text', { array: true })
  features: string[];
}
