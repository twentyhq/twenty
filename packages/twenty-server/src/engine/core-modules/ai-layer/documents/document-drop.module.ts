import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { AILayerModule } from '../ai-layer.module';
import { DocumentDropService } from './document-drop.service';

/**
 * Document Drop Module - Knowledge Pipeline Integration.
 *
 * Provides document upload capabilities that flow through:
 * Twenty → Supabase Storage → n8n → Docling → kb-mcp
 */
@Module({
  imports: [
    HttpModule.register({
      timeout: 15000,
      maxRedirects: 3,
    }),
    AILayerModule,
  ],
  providers: [DocumentDropService],
  exports: [DocumentDropService],
})
export class DocumentDropModule {}
