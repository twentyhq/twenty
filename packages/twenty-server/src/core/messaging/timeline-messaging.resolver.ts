import { Args, Query, Field, Resolver, ObjectType } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Column, Entity } from 'typeorm';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';

@Entity({ name: 'timelineMessage', schema: 'core' })
@ObjectType('TimelineMessage')
class TimelineMessage {
  @Field({ nullable: true })
  @Column({ nullable: true })
  read: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  senderName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  senderPictureUrl: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  numberOfEmailsInThread: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  subject: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  body: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  receivedAt: Date;
}

@UseGuards(JwtAuthGuard)
@Resolver(() => [TimelineMessage])
export class TimelineMessagingResolver {
  //constructor() {}

  @Query(() => [TimelineMessage])
  async timelineMessage(@Args('personId') personId: string) {
    return [
      {
        read: true,
        senderName: 'John Doe',
        senderPictureUrl: '',
        numberOfEmailsInThread: 1,
        subject: 'This is a subject',
        body: 'This is a body',
        receivedAt: new Date(),
      },
    ];
  }
}
