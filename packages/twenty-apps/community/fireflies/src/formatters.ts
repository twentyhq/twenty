import type { FirefliesMeetingData, FirefliesSentence, MeetingCreateInput } from './types';

export class MeetingFormatter {
  // Format timestamp from seconds to MM:SS
  private static formatTimestamp(timeStr: string): string {
    const seconds = parseFloat(timeStr);
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Format full transcript from sentences
  private static formatTranscript(sentences: FirefliesSentence[]): string {
    if (!sentences || sentences.length === 0) return '';

    let transcript = '';
    let currentSpeaker = '';

    for (const sentence of sentences) {
      const timestamp = this.formatTimestamp(sentence.start_time);
      const speaker = sentence.speaker_name || 'Unknown';

      // Add speaker header when speaker changes
      if (speaker !== currentSpeaker) {
        currentSpeaker = speaker;
        transcript += `\n**${speaker}** [${timestamp}]\n`;
      }

      transcript += `${sentence.text} `;
    }

    return transcript.trim();
  }

  static formatNoteBody(meetingData: FirefliesMeetingData): string {
    const meetingDate = meetingData.date ? new Date(meetingData.date) : null;
    const hasValidDate = meetingDate instanceof Date && !Number.isNaN(meetingDate.getTime());
    const formattedDate = hasValidDate
      ? meetingDate.toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Unknown date';
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

    // Detailed AI Notes (the rich content from Fireflies)
    if (meetingData.summary?.notes) {
      noteBody += `\n## Meeting Notes\n${meetingData.summary.notes}\n`;
    }

    // Bullet gist with emojis (if available and different from notes)
    if (meetingData.summary?.bullet_gist && !meetingData.summary?.notes) {
      noteBody += `\n## Key Points\n${meetingData.summary.bullet_gist}\n`;
    }

    // Meeting outline with timestamps (shorthand_bullet contains the timestamped outline)
    const outline = meetingData.summary?.outline || meetingData.summary?.shorthand_bullet;
    if (outline) {
      noteBody += `\n## Outline\n${outline}\n`;
    }

    // Key topics
    if (meetingData.summary?.topics_discussed?.length) {
      noteBody += `\n## Key Topics\n`;
      meetingData.summary.topics_discussed.forEach(topic => {
        noteBody += `- ${topic}\n`;
      });
    }

    // Action items
    if (meetingData.summary?.action_items?.length) {
      noteBody += `\n## Action Items\n`;
      meetingData.summary.action_items.forEach(item => {
        noteBody += `- [ ] ${item}\n`;
      });
    }

    // Insights section
    noteBody += `\n## Insights\n`;

    if (meetingData.summary?.keywords?.length) {
      noteBody += `**Keywords:** ${meetingData.summary.keywords.join(', ')}\n`;
    }

    if (meetingData.analytics?.sentiments) {
      const sentiments = meetingData.analytics.sentiments;
      noteBody += `**Sentiment:** ${sentiments.positive_pct}% positive, ${sentiments.negative_pct}% negative, ${sentiments.neutral_pct}% neutral\n`;
    }

    if (meetingData.summary?.meeting_type) {
      noteBody += `**Meeting Type:** ${meetingData.summary.meeting_type}\n`;
    }

    // Speaker analytics (Business+)
    if (meetingData.analytics?.speakers?.length) {
      noteBody += `\n### Speaker Stats\n`;
      for (const speaker of meetingData.analytics.speakers) {
        const talkTime = Math.round(speaker.duration / 60);
        noteBody += `- **${speaker.name}**: ${talkTime} min talk time, ${speaker.word_count} words, ${speaker.questions} questions\n`;
      }
    }

    // Meeting metrics (Business+)
    if (meetingData.analytics?.categories) {
      const cats = meetingData.analytics.categories;
      noteBody += `\n### Meeting Metrics\n`;
      noteBody += `- Questions asked: ${cats.questions}\n`;
      noteBody += `- Tasks identified: ${cats.tasks}\n`;
      if (cats.metrics > 0) noteBody += `- Metrics mentioned: ${cats.metrics}\n`;
      if (cats.date_times > 0) noteBody += `- Dates/times discussed: ${cats.date_times}\n`;
    }

    // Resources section
    noteBody += `\n## Resources\n`;
    noteBody += `[View Full Transcript on Fireflies](${meetingData.transcript_url})\n`;

    if (meetingData.video_url) {
      noteBody += `[Watch Video Recording](${meetingData.video_url})\n`;
    }

    if (meetingData.audio_url) {
      noteBody += `[Listen to Audio](${meetingData.audio_url})\n`;
    }

    if (meetingData.meeting_link) {
      noteBody += `[Original Meeting Link](${meetingData.meeting_link})\n`;
    }

    return noteBody;
  }

  static toMeetingCreateInput(
    meetingData: FirefliesMeetingData,
    noteId?: string
  ): MeetingCreateInput {
    const durationMinutes = Math.round(meetingData.duration);
    const hasSummary = Boolean(meetingData.summary?.overview || meetingData.summary?.action_items?.length);
    const hasAnalytics = Boolean(meetingData.analytics?.sentiments);

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

    // Basic fields (All plans)
    if (meetingData.organizer_email) {
      input.organizerEmail = meetingData.organizer_email;
    }
    if (meetingData.transcript_url?.trim()) {
      input.transcriptUrl = {
        primaryLinkUrl: meetingData.transcript_url,
        primaryLinkLabel: 'View Transcript'
      };
    }
    if (meetingData.meeting_link?.trim()) {
      input.meetingLink = {
        primaryLinkUrl: meetingData.meeting_link,
        primaryLinkLabel: 'Join Meeting'
      };
    }

    // Pro+ fields (transcript, summary, notes, keywords, audio)
    if (meetingData.sentences?.length) {
      input.transcript = this.formatTranscript(meetingData.sentences);
    }
    if (meetingData.summary?.overview) {
      input.overview = meetingData.summary.overview;
    }
    if (meetingData.summary?.notes) {
      input.notes = meetingData.summary.notes;
    }
    if (meetingData.summary?.keywords?.length) {
      input.keywords = meetingData.summary.keywords.join(', ');
    }
    if (meetingData.audio_url?.trim()) {
      input.audioUrl = {
        primaryLinkUrl: meetingData.audio_url,
        primaryLinkLabel: 'Listen to Audio'
      };
    }

    // Business+ fields (analytics, video, detailed summary)
    if (meetingData.summary?.meeting_type) {
      input.meetingType = meetingData.summary.meeting_type;
    }
    if (meetingData.summary?.topics_discussed?.length) {
      input.topics = meetingData.summary.topics_discussed.join(', ');
    }
    if (meetingData.analytics?.sentiments) {
      const sentiments = meetingData.analytics.sentiments;
      input.positivePercent = sentiments.positive_pct;
      input.negativePercent = sentiments.negative_pct;
      input.neutralPercent = sentiments.neutral_pct;
    }
    if (meetingData.video_url?.trim()) {
      input.videoUrl = {
        primaryLinkUrl: meetingData.video_url,
        primaryLinkLabel: 'Watch Video'
      };
    }

    // Import status based on data completeness
    const isPartial = !hasSummary && !hasAnalytics;
    input.importStatus = isPartial ? 'PARTIAL' : 'SUCCESS';
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

