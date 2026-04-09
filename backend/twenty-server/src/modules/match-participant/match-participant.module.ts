import { Module } from '@nestjs/common';

import { MatchParticipantService } from 'src/modules/match-participant/match-participant.service';

@Module({
  imports: [],
  providers: [MatchParticipantService],
  exports: [MatchParticipantService],
})
export class MatchParticipantModule {}
