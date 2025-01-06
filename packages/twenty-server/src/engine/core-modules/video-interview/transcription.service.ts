import { Injectable, BadRequestException } from '@nestjs/common';
import OpenAI from 'openai';
import * as fs from 'fs';

@Injectable()
export class TranscriptionService {
  private openai: OpenAI;

  constructor() {
    console.log('Going to use for transcprition OPENAI_API_KEY:', process.env.OPENAI_KEY);
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_KEY,
    });
  }

  async transcribeAudio(audioFilePath: string): Promise<string> {
    try {
      const resp = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath),
        model: 'whisper-1',
      });

      const transcript = resp.text;

      // Content moderation check
      const response = await this.openai.moderations.create({
        input: transcript,
      });

      if (response.results[0].flagged) {
        throw new BadRequestException('Inappropriate content detected. Please try again.');
      }

      return transcript;
    } catch (error) {
      console.error('Transcription error', error);
      throw new BadRequestException('Error during transcription');
    }
  }
}
