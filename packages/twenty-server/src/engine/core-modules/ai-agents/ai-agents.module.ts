import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CsmAgent } from './csm-agent/csm-agent.entity';
import { CsmAgentService } from './csm-agent/csm-agent.service';
import { DataHygieneAgent, DataQualityIssue } from './data-hygiene-agent/data-hygiene-agent.entity';
import { DataHygieneAgentService } from './data-hygiene-agent/data-hygiene-agent.service';
import { DealQualification, DealQualificationAgent } from './deal-qualification-agent/deal-qualification-agent.entity';
import { DealQualificationAgentService } from './deal-qualification-agent/deal-qualification-agent.service';
import { MeetingNotesAgent, MeetingTranscript } from './meeting-notes-agent/meeting-notes-agent.entity';
import { MeetingNotesAgentService } from './meeting-notes-agent/meeting-notes-agent.service';
import { ProspectResearch, ProspectingResearchAgent } from './prospecting-research-agent/prospecting-research-agent.entity';
import { ProspectingResearchAgentService } from './prospecting-research-agent/prospecting-research-agent.service';
import { SdrAgent } from './sdr-agent/sdr-agent.entity';
import { SdrAgentService } from './sdr-agent/sdr-agent.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        SdrAgent,
        CsmAgent,
        DataHygieneAgent,
        DataQualityIssue,
        DealQualificationAgent,
        DealQualification,
        MeetingNotesAgent,
        MeetingTranscript,
        ProspectingResearchAgent,
        ProspectResearch,
      ],
      'core',
    ),
  ],
  providers: [
    SdrAgentService,
    CsmAgentService,
    DataHygieneAgentService,
    DealQualificationAgentService,
    MeetingNotesAgentService,
    ProspectingResearchAgentService,
  ],
  exports: [
    SdrAgentService,
    CsmAgentService,
    DataHygieneAgentService,
    DealQualificationAgentService,
    MeetingNotesAgentService,
    ProspectingResearchAgentService,
  ],
})
export class AiAgentsModule {}
