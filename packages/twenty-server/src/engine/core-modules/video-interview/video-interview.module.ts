import { Module } from '@nestjs/common';

// import { NestjsFormDataModule } from 'nestjs-form-data';
import { VideoInterviewController } from 'src/engine/core-modules/video-interview/video-interview.controller';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { TranscriptionService } from 'src/engine/core-modules/video-interview/transcription.service';
import { MulterModule } from '@nestjs/platform-express';
import { WorkspaceModificationsModule } from '../workspace-modifications/workspace-modifications.module';

@Module({
  imports: [
    AuthModule,
    MulterModule.register({
      dest: './uploads',
    }),
    WorkspaceModificationsModule,

  ],
  controllers: [VideoInterviewController],
  providers: [TranscriptionService],
  exports: [],
})
export class VideoInterviewModule {}
