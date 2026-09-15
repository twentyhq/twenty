import { type Meeting } from 'fathom-typescript/sdk/models/shared';

export const buildFathomMeeting = ({
  recordingId,
  recorderEmail = 'owner@example.com',
  inviteeEmails = [],
  recordingStartTime = '2026-08-20T10:00:00.000Z',
}: {
  recordingId: number;
  recorderEmail?: string;
  inviteeEmails?: string[];
  recordingStartTime?: string;
}): Meeting => ({
  title: `Recording ${recordingId}`,
  meetingTitle: `Meeting ${recordingId}`,
  meetingType: null,
  recordingId,
  url: `https://fathom.video/calls/${recordingId}`,
  meetingUrl: 'https://meet.example.com/customer-call',
  shareUrl: `https://fathom.video/share/${recordingId}`,
  createdAt: new Date(recordingStartTime),
  scheduledStartTime: new Date(recordingStartTime),
  scheduledEndTime: new Date(Date.parse(recordingStartTime) + 30 * 60_000),
  recordingStartTime: new Date(recordingStartTime),
  recordingEndTime: new Date(Date.parse(recordingStartTime) + 30 * 60_000),
  calendarInviteesDomainsType: 'one_or_more_external',
  sharedWith: 'single_team',
  transcriptLanguage: 'en',
  calendarInvitees: inviteeEmails.map((email) => ({
    name: email,
    email,
    emailDomain: email.split('@')[1],
    isExternal: true,
  })),
  recordedBy: {
    name: recorderEmail,
    email: recorderEmail,
    emailDomain: recorderEmail.split('@')[1],
    team: 'Sales',
  },
});
