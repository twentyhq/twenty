import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportTicketEntity, SLAPolicyEntity, TicketCommentEntity } from './support-ticket.entity';
import { SupportTicketService } from './support-ticket.service';
import { SupportTicketResolver } from './support-ticket.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupportTicketEntity, SLAPolicyEntity, TicketCommentEntity]),
  ],
  providers: [SupportTicketService, SupportTicketResolver],
  exports: [SupportTicketService],
})
export class SupportTicketModule {}
