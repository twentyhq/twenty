import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KBArticleEntity, KBCategoryEntity } from './knowledge-base.entity';
import { KnowledgeBaseService } from './knowledge-base.service';
import { KnowledgeBaseResolver } from './knowledge-base.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([KBArticleEntity, KBCategoryEntity])],
  providers: [KnowledgeBaseService, KnowledgeBaseResolver],
  exports: [KnowledgeBaseService],
})
export class KnowledgeBaseModule {}
