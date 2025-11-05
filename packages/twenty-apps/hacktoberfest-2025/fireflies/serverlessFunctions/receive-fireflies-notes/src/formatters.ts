import type { FirefliesMeetingData, MeetingCreateInput } from './types';

export class MeetingFormatter {
  static formatNoteBody(meetingData: FirefliesMeetingData): string {
    const meetingDate = new Date(meetingData.date);
    const formattedDate = meetingDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const durationMinutes = Math.round(meetingData.duration);

    let noteBody = `**Date:** ${formattedDate}\n`;
    noteBody += `**Duration:** ${durationMinutes} minutes\n`;

    if (meetingData.participants.length > 0) {
      const participantNames = meetingData.participants.map(p => p.name).join(', ');
      noteBody += `**Participants:** ${participantNames}\n`;
    }

    // Overview section
    if (meetingData.summary?.overview) {
      noteBody += `\n## Overview\n${meetingData.summary.overview}\n`;
    }

    // Key topics
    if (meetingData.summary?.topics_discussed && Array.isArray(meetingData.summary.topics_discussed) && meetingData.summary.topics_discussed.length > 0) {
      noteBody += `\n## Key Topics\n`;
      meetingData.summary.topics_discussed.forEach(topic => {
        noteBody += `- ${topic}\n`;
      });
    }

    // Action items
    if (meetingData.summary?.action_items && Array.isArray(meetingData.summary.action_items) && meetingData.summary.action_items.length > 0) {
      noteBody += `\n## Action Items\n`;
      meetingData.summary.action_items.forEach(item => {
        noteBody += `- ${item}\n`;
      });
    }

    // Insights section
    noteBody += `\n## Insights\n`;

    if (meetingData.summary?.keywords && Array.isArray(meetingData.summary.keywords) && meetingData.summary.keywords.length > 0) {
      noteBody += `**Keywords:** ${meetingData.summary.keywords.join(', ')}\n`;
    }

    if (meetingData.analytics?.sentiments) {
      const sentiments = meetingData.analytics.sentiments;
      noteBody += `**Sentiment:** ${sentiments.positive_pct}% positive, ${sentiments.negative_pct}% negative, ${sentiments.neutral_pct}% neutral\n`;
    }

    if (meetingData.summary?.meeting_type) {
      noteBody += `**Meeting Type:** ${meetingData.summary.meeting_type}\n`;
    }

    // Resources section
    noteBody += `\n## Resources\n`;
    noteBody += `[View Full Transcript](${meetingData.transcript_url})\n`;

    if (meetingData.recording_url) {
      noteBody += `[Watch Recording](${meetingData.recording_url})\n`;
    }

    return noteBody;
  }

  static formatMeetingNotes(meetingData: FirefliesMeetingData): string {
    const meetingDate = new Date(meetingData.date);
    const formattedDate = meetingDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const durationMinutes = Math.round(meetingData.duration);

    let meetingNotes = `**Date:** ${formattedDate}\n`;
    meetingNotes += `**Duration:** ${durationMinutes} minutes\n`;

    if (meetingData.participants.length > 0) {
      const participantNames = meetingData.participants.map(p => p.name).join(', ');
      meetingNotes += `**Participants:** ${participantNames}\n`;
    }

    // Overview section
    if (meetingData.summary?.overview) {
      meetingNotes += `\n## Overview\n${meetingData.summary.overview}\n`;
    }

    // Key topics
    if (meetingData.summary?.topics_discussed && Array.isArray(meetingData.summary.topics_discussed) && meetingData.summary.topics_discussed.length > 0) {
      meetingNotes += `\n## Key Topics\n`;
      meetingData.summary.topics_discussed.forEach(topic => {
        meetingNotes += `- ${topic}\n`;
      });
    }

    // Action items
    if (meetingData.summary?.action_items && Array.isArray(meetingData.summary.action_items) && meetingData.summary.action_items.length > 0) {
      meetingNotes += `\n## Action Items\n`;
      meetingData.summary.action_items.forEach(item => {
        meetingNotes += `- ${item}\n`;
      });
    }

    // Insights section
    meetingNotes += `\n## Insights\n`;

    if (meetingData.summary?.keywords && Array.isArray(meetingData.summary.keywords) && meetingData.summary.keywords.length > 0) {
      meetingNotes += `**Keywords:** ${meetingData.summary.keywords.join(', ')}\n`;
    }

    if (meetingData.analytics?.sentiments) {
      const sentiments = meetingData.analytics.sentiments;
      meetingNotes += `**Sentiment:** ${sentiments.positive_pct}% positive, ${sentiments.negative_pct}% negative, ${sentiments.neutral_pct}% neutral\n`;
    }

    if (meetingData.summary?.meeting_type) {
      meetingNotes += `**Meeting Type:** ${meetingData.summary.meeting_type}\n`;
    }

    // Resources section
    meetingNotes += `\n## Resources\n`;
    meetingNotes += `[View Full Transcript](${meetingData.transcript_url})\n`;

    if (meetingData.recording_url) {
      meetingNotes += `[Watch Recording](${meetingData.recording_url})\n`;
    }

    return meetingNotes;
  }


  static toMeetingCreateInput(
    meetingData: FirefliesMeetingData,
    noteId?: string
  ): MeetingCreateInput {
    const durationMinutes = Math.round(meetingData.duration);

    // Build input object with only defined values (omit null fields)
    const input: MeetingCreateInput = {
      name: meetingData.title,
      meetingDate: meetingData.date,
      duration: durationMinutes,
      actionItemsCount: meetingData.summary?.action_items?.length || 0,
      firefliesMeetingId: meetingData.id,
    };

    // Add direct relationship to note if noteId is provided
    if (noteId) {
      input.noteId = noteId;
    }

    // Only add optional fields if they have values
    if (meetingData.summary?.meeting_type) {
      input.meetingType = meetingData.summary.meeting_type;
    }

    if (meetingData.summary?.keywords && Array.isArray(meetingData.summary.keywords) && meetingData.summary.keywords.length > 0) {
      input.keywords = meetingData.summary.keywords.join(', ');
    }

    if (meetingData.analytics?.sentiments?.positive_pct) {
      input.sentimentScore = meetingData.analytics.sentiments.positive_pct / 100;
      input.positivePercent = meetingData.analytics.sentiments.positive_pct;
    }

    if (meetingData.analytics?.sentiments?.negative_pct) {
      input.negativePercent = meetingData.analytics.sentiments.negative_pct;
    }

    // Only add URLs if they are valid (not empty strings)
    if (meetingData.transcript_url && meetingData.transcript_url.trim()) {
      input.transcriptUrl = {
        primaryLinkUrl: meetingData.transcript_url,
        primaryLinkLabel: 'View Transcript'
      };
    }

    if (meetingData.recording_url && meetingData.recording_url.trim()) {
      input.recordingUrl = {
        primaryLinkUrl: meetingData.recording_url,
        primaryLinkLabel: 'Watch Recording'
      };
    }

    if (meetingData.organizer_email) {
      input.organizerEmail = meetingData.organizer_email;
    }

    // Set success status and timestamps
    input.importStatus = 'SUCCESS';
    input.lastImportAttempt = new Date().toISOString();
    input.importAttempts = 1;

    return input;
  }

  static toFailedMeetingCreateInput(
    meetingId: string,
    title: string,
    error: string,
    attempts: number = 1
  ): MeetingCreateInput {
    const currentDate = new Date().toISOString();

    return {
      name: title || `Failed Meeting Import - ${meetingId}`,
      meetingDate: currentDate,
      duration: 0,
      actionItemsCount: 0,
      firefliesMeetingId: meetingId,
      importStatus: 'FAILED',
      importError: error,
      lastImportAttempt: currentDate,
      importAttempts: attempts,
    };
  }
}

