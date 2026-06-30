// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

// Set up the SDK logger bridge between main and renderer
contextBridge.exposeInMainWorld('sdkLoggerBridge', {
  // Receive logs from main process
  onSdkLog: (callback) => ipcRenderer.on('sdk-log', (_, logEntry) => callback(logEntry)),

  // Send logs from renderer to main process
  sendSdkLog: (logEntry) => ipcRenderer.send('sdk-log', logEntry)
});

contextBridge.exposeInMainWorld('electronAPI', {
  navigate: (page) => ipcRenderer.send('navigate', page),
  saveMeetingsData: (data) => ipcRenderer.invoke('saveMeetingsData', data),
  loadMeetingsData: () => ipcRenderer.invoke('loadMeetingsData'),
  deleteMeeting: (meetingId) => ipcRenderer.invoke('deleteMeeting', meetingId),
  generateMeetingSummary: (meetingId) => ipcRenderer.invoke('generateMeetingSummary', meetingId),
  generateMeetingSummaryStreaming: (meetingId) => ipcRenderer.invoke('generateMeetingSummaryStreaming', meetingId),
  startManualRecording: (meetingId) => ipcRenderer.invoke('startManualRecording', meetingId),
  stopManualRecording: (recordingId) => ipcRenderer.invoke('stopManualRecording', recordingId),
  debugGetHandlers: () => ipcRenderer.invoke('debugGetHandlers'),
  checkForDetectedMeeting: () => ipcRenderer.invoke('checkForDetectedMeeting'),
  joinDetectedMeeting: () => ipcRenderer.invoke('joinDetectedMeeting'),
  onOpenMeetingNote: (callback) => ipcRenderer.on('open-meeting-note', (_, meetingId) => callback(meetingId)),
  onRecordingCompleted: (callback) => ipcRenderer.on('recording-completed', (_, meetingId) => callback(meetingId)),
  onTranscriptUpdated: (callback) => ipcRenderer.on('transcript-updated', (_, meetingId) => callback(meetingId)),
  onSummaryGenerated: (callback) => ipcRenderer.on('summary-generated', (_, meetingId) => callback(meetingId)),
  onSummaryUpdate: (callback) => ipcRenderer.on('summary-update', (_, data) => callback(data)),
  onRecordingStateChange: (callback) => ipcRenderer.on('recording-state-change', (_, data) => callback(data)),
  onParticipantsUpdated: (callback) => ipcRenderer.on('participants-updated', (_, meetingId) => callback(meetingId)),
  onVideoFrame: (callback) => ipcRenderer.on('video-frame', (_, data) => callback(data)),
  onMeetingDetectionStatus: (callback) => ipcRenderer.on('meeting-detection-status', (_, data) => callback(data)),
  onMeetingTitleUpdated: (callback) => ipcRenderer.on('meeting-title-updated', (_, data) => callback(data)),
  getActiveRecordingId: (noteId) => ipcRenderer.invoke('getActiveRecordingId', noteId),
  openExternal: (url) => ipcRenderer.invoke('openExternal', url),
  getRecordingVideoUrl: (recordingId) => ipcRenderer.invoke('getRecordingVideoUrl', recordingId)
});
