const { app, BrowserWindow, ipcMain, protocol, Notification, shell, nativeImage } = require('electron');
const path = require('node:path');
const url = require('url');
const fs = require('fs');
const RecallAiSdk = require('@recallai/desktop-sdk');
const axios = require('axios');
const OpenAI = require('openai');
const sdkLogger = require('./sdk-logger');
const twentyClient = require('./twenty-client');
require('dotenv').config();

const twentyIconDataUrl = require('./assets/twenty-logo-256.png');

function getAppIcon() {
  try {
    return nativeImage.createFromDataURL(twentyIconDataUrl);
  } catch (error) {
    console.error('Failed to load app icon:', error);
    return undefined;
  }
}

// Function to get the OpenRouter headers
function getHeaderLines() {
  return [
    "HTTP-Referer: https://recall.ai", // Replace with your actual app's URL
    "X-Title: Twenty AI Notetaker"
  ];
}

let openai = null;

function getOpenAIClient() {
  if (openai) return openai;
  if (!process.env.OPENROUTER_KEY) return null;

  openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_KEY,
    defaultHeaders: {
      "HTTP-Referer": "https://recall.ai",
      "X-Title": "Twenty AI Notetaker"
    }
  });
  return openai;
}

// Define available models with their capabilities
const MODELS = {
  // Primary models
  PRIMARY: "anthropic/claude-3.7-sonnet",
  FALLBACKS: []
};

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Check Twenty CRM integration status at startup
twentyClient.isConfigured();

// Store detected meeting information
let detectedMeeting = null;

let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    icon: getAppIcon(),
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#f9f9f9',
  });

  // Allow the debug panel header to act as a drag region
  mainWindow.on('ready-to-show', () => {
    try {
      // Set regions that can be used to drag the window
      if (process.platform === 'darwin') {
        // Only needed on macOS
        mainWindow.setWindowButtonVisibility(true);
      }
    } catch (error) {
      console.error('Error setting drag regions:', error);
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools in development
  if (process.env.NODE_ENV === 'development') {
    // mainWindow.webContents.openDevTools();
  }

  // Listen for navigation events
  ipcMain.on('navigate', (event, page) => {
    if (page === 'note-editor') {
      mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY + '/../note-editor/index.html');
    } else if (page === 'home') {
      mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    }
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  if (process.platform === 'darwin' && app.dock) {
    const dockIcon = getAppIcon();
    if (dockIcon && !dockIcon.isEmpty()) {
      app.dock.setIcon(dockIcon);
      console.log('Twenty dock icon set successfully');
    } else {
      console.error('Failed to set dock icon: image is empty or undefined');
    }
  }

  console.log("Registering IPC handlers...");
  // Log all registered IPC handlers
  console.log("IPC handlers:", Object.keys(ipcMain._invokeHandlers));

  // Set up SDK logger IPC handlers
  ipcMain.on('sdk-log', (event, logEntry) => {
    // Forward logs from renderer to any open windows
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('sdk-log', logEntry);
    }
  });

  // Set up logger event listener to send logs from main to renderer
  sdkLogger.onLog((logEntry) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('sdk-log', logEntry);
    }
  });

  // Create meetings file if it doesn't exist
  try {
    if (!fs.existsSync(meetingsFilePath)) {
      const initialData = { upcomingMeetings: [], pastMeetings: [] };
      fs.writeFileSync(meetingsFilePath, JSON.stringify(initialData, null, 2));
    }
  } catch (e) {
    console.error("Couldn't create the meetings file:", e);
  }

  // Initialize the Recall.ai SDK
  initSDK();

  createWindow();

  // When the window is ready, send the initial meeting detection status
  mainWindow.webContents.on('did-finish-load', () => {
    // Send the initial meeting detection status
    mainWindow.webContents.send('meeting-detection-status', { detected: detectedMeeting !== null });
  });

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// Path to meetings data file in the user's Application Support directory
const meetingsFilePath = path.join(app.getPath('userData'), 'meetings.json');

// Global state to track active recordings
const activeRecordings = {
  // Map of recordingId -> {noteId, platform, state}
  recordings: {},

  // Register a new recording
  addRecording: function (recordingId, noteId, platform = 'unknown') {
    this.recordings[recordingId] = {
      noteId,
      platform,
      state: 'recording',
      startTime: new Date()
    };
    console.log(`Recording registered in global state: ${recordingId} for note ${noteId}`);
  },

  // Update a recording's state
  updateState: function (recordingId, state) {
    if (this.recordings[recordingId]) {
      this.recordings[recordingId].state = state;
      console.log(`Recording ${recordingId} state updated to: ${state}`);
      return true;
    }
    return false;
  },

  // Remove a recording
  removeRecording: function (recordingId) {
    if (this.recordings[recordingId]) {
      delete this.recordings[recordingId];
      console.log(`Recording ${recordingId} removed from global state`);
      return true;
    }
    return false;
  },

  // Get active recording for a note
  getForNote: function (noteId) {
    for (const [recordingId, info] of Object.entries(this.recordings)) {
      if (info.noteId === noteId) {
        return { recordingId, ...info };
      }
    }
    return null;
  },

  // Get all active recordings
  getAll: function () {
    return { ...this.recordings };
  }
};

// File operation manager to prevent race conditions on both reads and writes
const fileOperationManager = {
  isProcessing: false,
  pendingOperations: [],
  cachedData: null,
  lastReadTime: 0,

  // Read the meetings data with caching to reduce file I/O
  readMeetingsData: async function () {
    // If we have cached data that's recent (less than 500ms old), use it
    const now = Date.now();
    if (this.cachedData && (now - this.lastReadTime < 500)) {
      return JSON.parse(JSON.stringify(this.cachedData)); // Deep clone
    }

    try {
      // Read from file
      const fileData = await fs.promises.readFile(meetingsFilePath, 'utf8');
      const data = JSON.parse(fileData);

      // Update cache
      this.cachedData = data;
      this.lastReadTime = now;

      return data;
    } catch (error) {
      console.error('Error reading meetings data:', error);
      // If file doesn't exist or is invalid, return empty structure
      return { upcomingMeetings: [], pastMeetings: [] };
    }
  },

  // Schedule an operation that needs to update the meetings data
  scheduleOperation: async function (operationFn) {
    return new Promise((resolve, reject) => {
      // Add this operation to the queue
      this.pendingOperations.push({
        operationFn, // This function will receive the current data and return updated data
        resolve,
        reject
      });

      // Process the queue if not already processing
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  },

  // Process the operation queue sequentially
  processQueue: async function () {
    if (this.pendingOperations.length === 0 || this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      // Get the next operation
      const nextOp = this.pendingOperations.shift();

      // Read the latest data
      const currentData = await this.readMeetingsData();

      try {
        // Execute the operation function with the current data
        const updatedData = await nextOp.operationFn(currentData);

        // If the operation returned data, write it
        if (updatedData) {
          // Update cache immediately
          this.cachedData = updatedData;
          this.lastReadTime = Date.now();

          // Write to file
          await fs.promises.writeFile(meetingsFilePath, JSON.stringify(updatedData, null, 2));
        }

        // Resolve the operation's promise
        nextOp.resolve({ success: true });
      } catch (opError) {
        console.error('Error in file operation:', opError);
        nextOp.reject(opError);
      }
    } catch (error) {
      console.error('Error in file operation manager:', error);

      // If there was an operation that failed, reject its promise
      if (this.pendingOperations.length > 0) {
        const failedOp = this.pendingOperations.shift();
        failedOp.reject(error);
      }
    } finally {
      this.isProcessing = false;

      // Check if more operations were added while we were processing
      if (this.pendingOperations.length > 0) {
        setImmediate(() => this.processQueue());
      }
    }
  },

  // Helper to write data directly - internally uses scheduleOperation
  writeData: async function (data) {
    return this.scheduleOperation(() => data); // Simply return the data to write
  }
};

function buildRecallRecordingUrl(uploadId) {
  if (!uploadId) return null;
  return `recall://recording/${uploadId}`;
}

// Create a desktop SDK upload token
async function createDesktopSdkUpload() {
  try {
    const response = await axios.get("http://localhost:13373/start-recording", { timeout: 10000 });

    if (response.data.status !== 'success') {
      console.error("Failed to create upload token:", response.data.message);
      return null;
    } else {
      console.log("Upload token created successfully:", response.data.upload_token);
      return response.data;
    }
  } catch (error) {
    console.error("Error creating upload token:", JSON.stringify(error.errors || error.message || error));
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    return null;
  }
}

// Poll Recall for the audio URL then call the Twenty end-recording logic function.
// Recall may need time to process the upload after progress hits 100%.
async function endCallRecordingWithRetry(windowId, maxAttempts = 10, delayMs = 5000) {
  try {
    const meetingsData = await fileOperationManager.readMeetingsData();
    const meeting = meetingsData.pastMeetings.find(
      (meetingItem) => meetingItem.recallUploadId === windowId
        || meetingItem.recordingId === windowId,
    );

    if (!meeting?.twentyRecordId || !meeting?.recallRecordingId) {
      console.log('[Twenty] No Twenty record or Recall recording ID found, skipping end-recording');
      return;
    }

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const recallResponse = await axios.get(
          `http://localhost:13373/recording/${meeting.recallRecordingId}`,
          { timeout: 15000 },
        );

        const audioUrl = recallResponse.data?.video_url || null;
        const transcriptUrl = recallResponse.data?.transcript_url || null;

        if (audioUrl) {
          await twentyClient.endCallRecording({
            callRecordingId: meeting.twentyRecordId,
            audioUrl,
            transcriptUrl,
            participants: meeting.participants,
            localTranscript: meeting.transcript || [],
          });
          return;
        }
      } catch (error) {
        console.error(`[Twenty] Attempt ${attempt}/${maxAttempts} — error fetching recording:`, error.message);
      }

      if (attempt < maxAttempts) {
        console.log(`[Twenty] Audio URL not ready, retrying in ${delayMs / 1000}s (${attempt}/${maxAttempts})`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    console.error('[Twenty] Audio URL never became available, giving up');
  } catch (error) {
    console.error('Failed to end callRecording in Twenty:', error.message);
  }
}

// Initialize the Recall.ai SDK
function initSDK() {
  console.log("Initializing Recall.ai SDK");

  // Log the SDK initialization
  sdkLogger.logApiCall('init', {
    dev: process.env.NODE_ENV === 'development',
    api_url: process.env.RECALLAI_API_URL
  });

  RecallAiSdk.init({
    api_url: process.env.RECALLAI_API_URL
  });

  RecallAiSdk.addEventListener('permission-status', (evt) => {
    console.log(`Permission: ${evt.permission}, Status: ${evt.status}`);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('permission-status', evt);
    }
  });

  RecallAiSdk.addEventListener('log', (evt) => {
    if (evt.level === 'debug') return;

    const prefix = `[SDK ${evt.level}] [${evt.subsystem}/${evt.category}]`;
    if (evt.level === 'error') {
      console.error(prefix, evt.message);
    } else if (evt.level === 'warning') {
      console.warn(prefix, evt.message);
    } else {
      console.log(prefix, evt.message);
    }

    // Track active speaker from LibbotMeetingRecorder participant updates
    if (evt.message && evt.message.includes('isActiveSpeaker: true')) {
      const nameMatch = evt.message.match(/name:\s*([^,]+),/);
      if (nameMatch) {
        const speakerName = nameMatch[1].trim();
        if (speakerName !== currentActiveSpeaker) {
          currentActiveSpeaker = speakerName;
          console.log(`[speaker-debug] Active speaker changed to: ${currentActiveSpeaker}`);
        }
      }
    }
  });

  // Listen for meeting detected events
  RecallAiSdk.addEventListener('meeting-detected', (evt) => {
    console.log("Meeting detected:", evt);

    // Log the meeting detected event
    sdkLogger.logEvent('meeting-detected', {
      platform: evt.window.platform,
      windowId: evt.window.id
    });

    detectedMeeting = evt;

    // Map platform codes to readable names
    const platformNames = {
      'zoom': 'Zoom',
      'google-meet': 'Google Meet',
      'slack': 'Slack',
      'teams': 'Microsoft Teams'
    };

    // Get a user-friendly platform name, or use the raw platform name if not in our map
    const platformName = platformNames[evt.window.platform] || evt.window.platform;

    // Send a notification
    let notification = new Notification({
      title: `${platformName} Meeting Detected`,
      body: platformName,
    });

    // Handle notification click
    notification.on('click', () => {
      console.log("Notification clicked for platform:", platformName);
      joinDetectedMeeting();
    });

    notification.show();

    // Send the meeting detected status to the renderer process
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('meeting-detection-status', { detected: true });
    }
  });

  // Listen for meeting updated events (to capture title and URL)
  // NOTE: meeting-detected events do NOT guarantee title and URL will be populated.
  // The meeting title and URL are only reliably available in meeting-updated events,
  // which fire as the meeting metadata becomes available after initial detection.
  RecallAiSdk.addEventListener('meeting-updated', async (evt) => {
    console.log("Meeting updated:", evt);

    const { window } = evt;

    // Log the meeting updated event with the URL for tracking purposes
    sdkLogger.logEvent('meeting-updated', {
      platform: window.platform,
      windowId: window.id,
      title: window.title,
      url: window.url
    });

    // Update the detectedMeeting object with the new information
    if (detectedMeeting && detectedMeeting.window.id === window.id) {
      detectedMeeting = {
        ...detectedMeeting,
        window: {
          ...detectedMeeting.window,
          title: window.title,
          url: window.url
        }
      };

      console.log("Updated meeting title:", window.title);

      // If a note has already been created for this meeting, update its title retroactively
      if (window.title && global.activeMeetingIds && global.activeMeetingIds[window.id]) {
        const noteId = global.activeMeetingIds[window.id].noteId;
        
        if (noteId) {
          console.log("Updating existing note title for:", noteId);
          
          try {
            // Read the current meetings data
            const meetingsData = await fileOperationManager.readMeetingsData();
            
            // Find the meeting in pastMeetings
            const meeting = meetingsData.pastMeetings.find(m => m.id === noteId);
            
            if (meeting) {
              const oldTitle = meeting.title;
              
              // Update the title
              meeting.title = window.title;
              
              // Save the updated data
              await fileOperationManager.writeData(meetingsData);
              console.log(`Successfully updated meeting title from "${oldTitle}" to "${window.title}"`);
              
              // Notify the renderer to update the UI
              if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('meeting-title-updated', {
                  meetingId: noteId,
                  newTitle: window.title
                });
              }
            } else {
              console.error("Meeting not found in pastMeetings with ID:", noteId);
            }
          } catch (error) {
            console.error("Error updating meeting title:", error);
          }
        }
      }
    }
  });

  // Listen for meeting closed events
  RecallAiSdk.addEventListener('meeting-closed', async (evt) => {
    console.log("Meeting closed:", evt);

    // Log the SDK meeting-closed event
    sdkLogger.logEvent('meeting-closed', {
      windowId: evt.window.id
    });

    // Clean up the global tracking when a meeting ends
    if (evt.window && evt.window.id && global.activeMeetingIds && global.activeMeetingIds[evt.window.id]) {
      console.log(`Cleaning up meeting tracking for: ${evt.window.id}`);
      delete global.activeMeetingIds[evt.window.id];
    }

    detectedMeeting = null;

    // Send the meeting closed status to the renderer process
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('meeting-detection-status', { detected: false });
    }
  });

  // Listen for recording ended events
  RecallAiSdk.addEventListener('recording-ended', async (evt) => {
    console.log("Recording ended:", evt);

    // Log the SDK recording-ended event
    sdkLogger.logEvent('recording-ended', {
      windowId: evt.window.id
    });

    try {
      // Update the note with recording information
      await updateNoteWithRecordingInfo(evt.window.id);

      // Add a small delay before uploading (good practice for file system operations)
      setTimeout(async () => {
        try {
          // Try to get a new upload token for the upload if needed
          const uploadData = await createDesktopSdkUpload();

          if (uploadData && uploadData.upload_token) {
            console.log('Uploading recording with new upload token:', uploadData.upload_token);

            // Log the uploadRecording API call
            sdkLogger.logApiCall('uploadRecording', {
              windowId: evt.window.id,
              uploadToken: `${uploadData.upload_token.substring(0, 8)}...` // Log truncated token for security
            });

            await RecallAiSdk.uploadRecording({
              windowId: evt.window.id,
              uploadToken: uploadData.upload_token
            });
          } else {
            // Fallback to regular upload
            console.log('Uploading recording without new token');

            // Log the uploadRecording API call (fallback)
            sdkLogger.logApiCall('uploadRecording', {
              windowId: evt.window.id
            });

            await RecallAiSdk.uploadRecording({ windowId: evt.window.id });
          }
        } catch (uploadError) {
          console.error('Error during upload:', uploadError);
          // Fallback to regular upload

          // Log the uploadRecording API call (error fallback)
          sdkLogger.logApiCall('uploadRecording', {
            windowId: evt.window.id,
            error: 'Fallback after error'
          });

          await RecallAiSdk.uploadRecording({ windowId: evt.window.id });
        }
      }, 3000); // Wait 3 seconds before uploading
    } catch (error) {
      console.error("Error handling recording ended:", error);
    }
  });

  RecallAiSdk.addEventListener('permissions-granted', async (evt) => {
    console.log("PERMISSIONS GRANTED");
  });

  // Track upload progress
  RecallAiSdk.addEventListener('upload-progress', async (evt) => {
    const { progress, window } = evt;
    console.log(`Upload progress: ${progress}%`);

    // Log the SDK upload-progress event
    // sdkLogger.logEvent('upload-progress', {
    //   windowId: window.id,
    //   progress
    // });

    if (progress === 100) {
      console.log(`Upload completed for recording: ${window.id}`);

      if (twentyClient.isConfigured()) {
        endCallRecordingWithRetry(window.id);
      }
    }
  });

  // Track SDK state changes
  RecallAiSdk.addEventListener('sdk-state-change', async (evt) => {
    const { sdk: { state: { code } }, window } = evt;
    console.log("Recording state changed:", code, "for window:", window?.id);

    // Log the SDK sdk-state-change event
    sdkLogger.logEvent('sdk-state-change', {
      state: code,
      windowId: window?.id
    });

    // Update recording state in our global tracker
    if (window && window.id) {
      // Get the meeting note ID associated with this window
      let noteId = null;
      if (global.activeMeetingIds && global.activeMeetingIds[window.id]) {
        noteId = global.activeMeetingIds[window.id].noteId;
      }

      // Update the recording state in our tracker
      if (code === 'recording') {
        console.log('Recording in progress...');
        if (noteId) {
          // If recording started, add it to our active recordings
          activeRecordings.addRecording(window.id, noteId, window.platform || 'unknown');
        }
      } else if (code === 'paused') {
        console.log('Recording paused');
        activeRecordings.updateState(window.id, 'paused');
      } else if (code === 'idle') {
        console.log('Recording stopped');
        activeRecordings.removeRecording(window.id);
      }

      // Notify renderer process about recording state change
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('recording-state-change', {
          recordingId: window.id,
          state: code,
          noteId
        });
      }
    }
  });

  // Listen for real-time transcript events
  RecallAiSdk.addEventListener('realtime-event', async (evt) => {
    // Only log non-video frame events to prevent flooding the logger
    if (evt.event !== 'video_separate_png.data') {
      console.log("Received realtime event:", evt.event);

      // Log the SDK realtime-event event
      sdkLogger.logEvent('realtime-event', {
        eventType: evt.event,
        windowId: evt.window?.id
      });
    }

    // Handle different event types
    if (evt.event === 'transcript.data' && evt.data && evt.data.data) {
      await processTranscriptData(evt);
    }
    else if (evt.event === 'transcript.provider_data' && evt.data && evt.data.data) {
      await processTranscriptProviderData(evt);
    }
    else if (evt.event === 'participant_events.join' && evt.data && evt.data.data) {
      await processParticipantJoin(evt);
    }
    else if (evt.event === 'video_separate_png.data' && evt.data && evt.data.data) {
      await processVideoFrame(evt);
    }
  });

  // Handle errors
  RecallAiSdk.addEventListener('error', async (evt) => {
    console.error("RecallAI SDK Error:", evt);
    const { type, message } = evt;

    // Log the SDK error event
    sdkLogger.logEvent('error', {
      errorType: type,
      errorMessage: message
    });

    // Show notification for errors
    let notification = new Notification({
      title: 'Recording Error',
      body: `Error: ${type} - ${message}`,
    });
    notification.show();
  });
}

// Handle saving meetings data
ipcMain.handle('saveMeetingsData', async (event, data) => {
  try {
    // Use the file operation manager to safely write the file
    await fileOperationManager.writeData(data);
    return { success: true };
  } catch (error) {
    console.error('Failed to save meetings data:', error);
    return { success: false, error: error.message };
  }
});

// Debug handler to check if IPC handlers are registered
ipcMain.handle('debugGetHandlers', async () => {
  console.log("Checking registered IPC handlers...");
  const handlers = Object.keys(ipcMain._invokeHandlers);
  console.log("Registered handlers:", handlers);
  return handlers;
});

// Handler to get active recording ID for a note
ipcMain.handle('getActiveRecordingId', async (event, noteId) => {
  console.log(`getActiveRecordingId called for note: ${noteId}`);

  try {
    // If noteId is provided, get recording for that specific note
    if (noteId) {
      const recordingInfo = activeRecordings.getForNote(noteId);
      return {
        success: true,
        data: recordingInfo
      };
    }

    // Otherwise return all active recordings
    return {
      success: true,
      data: activeRecordings.getAll()
    };
  } catch (error) {
    console.error('Error getting active recording ID:', error);
    return { success: false, error: error.message };
  }
});

// Handle deleting a meeting
ipcMain.handle('deleteMeeting', async (event, meetingId) => {
  try {
    console.log(`Deleting meeting with ID: ${meetingId}`);

    // Read current data
    const fileData = await fs.promises.readFile(meetingsFilePath, 'utf8');
    const meetingsData = JSON.parse(fileData);

    // Find the meeting
    const pastMeetingIndex = meetingsData.pastMeetings.findIndex(meeting => meeting.id === meetingId);
    const upcomingMeetingIndex = meetingsData.upcomingMeetings.findIndex(meeting => meeting.id === meetingId);

    let meetingDeleted = false;
    let recordingId = null;

    // Remove from past meetings if found
    if (pastMeetingIndex !== -1) {
      // Store the recording ID for later cleanup if needed
      recordingId = meetingsData.pastMeetings[pastMeetingIndex].recordingId;

      // Remove the meeting
      meetingsData.pastMeetings.splice(pastMeetingIndex, 1);
      meetingDeleted = true;
    }

    // Remove from upcoming meetings if found
    if (upcomingMeetingIndex !== -1) {
      // Store the recording ID for later cleanup if needed
      recordingId = meetingsData.upcomingMeetings[upcomingMeetingIndex].recordingId;

      // Remove the meeting
      meetingsData.upcomingMeetings.splice(upcomingMeetingIndex, 1);
      meetingDeleted = true;
    }

    if (!meetingDeleted) {
      return { success: false, error: 'Meeting not found' };
    }

    // Save the updated data
    await fileOperationManager.writeData(meetingsData);

    // If the meeting had a recording, cleanup the reference in the global tracking
    if (recordingId && global.activeMeetingIds && global.activeMeetingIds[recordingId]) {
      console.log(`Cleaning up tracking for deleted meeting with recording ID: ${recordingId}`);
      delete global.activeMeetingIds[recordingId];
    }

    console.log(`Successfully deleted meeting: ${meetingId}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return { success: false, error: error.message };
  }
});

// Handle generating AI summary for a meeting (non-streaming)
ipcMain.handle('generateMeetingSummary', async (event, meetingId) => {
  try {
    console.log(`Manual summary generation requested for meeting: ${meetingId}`);

    // Read current data
    const fileData = await fs.promises.readFile(meetingsFilePath, 'utf8');
    const meetingsData = JSON.parse(fileData);

    // Find the meeting
    const pastMeetingIndex = meetingsData.pastMeetings.findIndex(meeting => meeting.id === meetingId);

    if (pastMeetingIndex === -1) {
      return { success: false, error: 'Meeting not found' };
    }

    const meeting = meetingsData.pastMeetings[pastMeetingIndex];

    // Check if there's a transcript to summarize
    if (!meeting.transcript || meeting.transcript.length === 0) {
      return {
        success: false,
        error: 'No transcript available for this meeting'
      };
    }

    // Log summary generation to console instead of showing a notification
    console.log('Generating AI summary for meeting: ' + meetingId);

    // Generate the summary
    const summary = await generateMeetingSummary(meeting);

    // Get meeting title for use in the new content
    const meetingTitle = meeting.title || "Meeting Notes";

    const recallLink = meeting.recallUrl
      ? `\n\n---\nRecording: ${meeting.recallUrl}`
      : '';

    // Create content with the AI-generated summary
    meeting.content = `# ${meetingTitle}\n\n${summary}${recallLink}`;

    meeting.hasSummary = true;

    // Save the updated data with summary
    await fileOperationManager.writeData(meetingsData);

    console.log('Updated meeting note with AI summary');

    // Notify the renderer to refresh the note if it's open
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('summary-generated', meetingId);
    }

    return {
      success: true,
      summary
    };
  } catch (error) {
    console.error('Error generating meeting summary:', error);
    return { success: false, error: error.message };
  }
});

// Handle starting a manual desktop recording
ipcMain.handle('startManualRecording', async (event, meetingId) => {
  try {
    console.log(`Starting manual desktop recording for meeting: ${meetingId}`);

    // Read current data
    const fileData = await fs.promises.readFile(meetingsFilePath, 'utf8');
    const meetingsData = JSON.parse(fileData);

    // Find the meeting
    const pastMeetingIndex = meetingsData.pastMeetings.findIndex(meeting => meeting.id === meetingId);

    if (pastMeetingIndex === -1) {
      return { success: false, error: 'Meeting not found' };
    }

    const meeting = meetingsData.pastMeetings[pastMeetingIndex];

    try {
      // Prepare desktop audio recording - this is the key difference from our previous implementation
      // It returns a key that we use as the window ID

      // Log the prepareDesktopAudioRecording API call
      sdkLogger.logApiCall('prepareDesktopAudioRecording');

      const key = await RecallAiSdk.prepareDesktopAudioRecording();
      console.log('Prepared desktop audio recording with key:', key);

      // Create a recording token
      const uploadData = await createDesktopSdkUpload();
      if (!uploadData || !uploadData.upload_token) {
        return { success: false, error: 'Failed to create recording token' };
      }

      // Store the recording ID in the meeting
      meeting.recordingId = key;

      // Store Recall upload/recording IDs for later linking
      meeting.recallUploadId = uploadData.upload_id;
      meeting.recallRecordingId = uploadData.recording_id;
      meeting.recallUrl = buildRecallRecordingUrl(uploadData.upload_id);

      // Initialize transcript array if not present
      if (!meeting.transcript) {
        meeting.transcript = [];
      }

      // Store tracking info for the recording
      global.activeMeetingIds = global.activeMeetingIds || {};
      global.activeMeetingIds[key] = {
        platformName: 'Desktop Recording',
        noteId: meetingId
      };

      // Register the recording in our active recordings tracker
      activeRecordings.addRecording(key, meetingId, 'Desktop Recording');

      // Save the updated data
      await fileOperationManager.writeData(meetingsData);

      // Start recording with the key from prepareDesktopAudioRecording
      console.log('Starting desktop recording with key:', key);

      // Log the startRecording API call
      sdkLogger.logApiCall('startRecording', {
        windowId: key,
        uploadToken: `${uploadData.upload_token.substring(0, 8)}...` // Log truncated token for security
      });

      await RecallAiSdk.startRecording({
        windowId: key,
        uploadToken: uploadData.upload_token
      });

      return {
        success: true,
        recordingId: key
      };
    } catch (sdkError) {
      console.error('RecallAI SDK error:', sdkError);
      return { success: false, error: 'Failed to prepare desktop recording: ' + sdkError.message };
    }
  } catch (error) {
    console.error('Error starting manual recording:', error);
    return { success: false, error: error.message };
  }
});

// Handle stopping a manual desktop recording
ipcMain.handle('stopManualRecording', async (event, recordingId) => {
  try {
    console.log(`Stopping manual desktop recording: ${recordingId}`);

    // Stop the recording - using the windowId property as shown in the reference

    // Log the stopRecording API call
    sdkLogger.logApiCall('stopRecording', {
      windowId: recordingId
    });

    // Update our active recordings tracker
    activeRecordings.updateState(recordingId, 'stopping');

    await RecallAiSdk.stopRecording({
      windowId: recordingId
    });

    // The recording-ended event will be triggered automatically,
    // which will handle uploading and generating the summary

    return { success: true };
  } catch (error) {
    console.error('Error stopping manual recording:', error);
    return { success: false, error: error.message };
  }
});

// Handle generating AI summary with streaming
ipcMain.handle('generateMeetingSummaryStreaming', async (event, meetingId) => {
  try {
    console.log(`Streaming summary generation requested for meeting: ${meetingId}`);

    // Read current data
    const fileData = await fs.promises.readFile(meetingsFilePath, 'utf8');
    const meetingsData = JSON.parse(fileData);

    // Find the meeting
    const pastMeetingIndex = meetingsData.pastMeetings.findIndex(meeting => meeting.id === meetingId);

    if (pastMeetingIndex === -1) {
      return { success: false, error: 'Meeting not found' };
    }

    const meeting = meetingsData.pastMeetings[pastMeetingIndex];

    // Check if there's a transcript to summarize
    if (!meeting.transcript || meeting.transcript.length === 0) {
      return {
        success: false,
        error: 'No transcript available for this meeting'
      };
    }

    // Log summary generation to console instead of showing a notification
    console.log('Generating streaming summary for meeting: ' + meetingId);

    // Get meeting title for use in the new content
    const meetingTitle = meeting.title || "Meeting Notes";

    // Initial content with placeholders
    meeting.content = `# ${meetingTitle}\n\nGenerating summary...`;

    // Update the note on the frontend right away
    mainWindow.webContents.send('summary-update', {
      meetingId,
      content: meeting.content
    });

    const recallLink = meeting.recallUrl
      ? `\n\n---\nRecording: ${meeting.recallUrl}`
      : '';

    // Create progress callback for streaming updates
    const streamProgress = (currentText) => {
      // Update content with current streaming text
      meeting.content = `# ${meetingTitle}\n\n## AI-Generated Meeting Summary\n${currentText}${recallLink}`;

      // Send immediate update to renderer - don't debounce or delay this
      if (mainWindow && !mainWindow.isDestroyed()) {
        try {
          // Force immediate send of the update
          mainWindow.webContents.send('summary-update', {
            meetingId,
            content: meeting.content,
            timestamp: Date.now()
          });
        } catch (err) {
          console.error('Error sending streaming update to renderer:', err);
        }
      }
    };

    // Generate summary with streaming
    const summary = await generateMeetingSummary(meeting, streamProgress);

    // Make sure the final content is set correctly
    meeting.content = `# ${meetingTitle}\n\n${summary}${recallLink}`;
    meeting.hasSummary = true;

    // Save the updated data with summary
    await fileOperationManager.writeData(meetingsData);

    console.log('Updated meeting note with AI summary (streaming)');

    // Final notification to renderer
    mainWindow.webContents.send('summary-generated', meetingId);

    return {
      success: true,
      summary
    };
  } catch (error) {
    console.error('Error generating streaming summary:', error);
    return { success: false, error: error.message };
  }
});

// Handle loading meetings data
ipcMain.handle('loadMeetingsData', async () => {
  try {
    // Use our file operation manager to safely read the data
    const data = await fileOperationManager.readMeetingsData();

    // Return the data
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Failed to load meetings data:', error);
    return { success: false, error: error.message };
  }
});

// Function to create a new meeting note and start recording
async function createMeetingNoteAndRecord(platformName) {
  console.log("Creating meeting note for platform:", platformName);
  try {
    if (!detectedMeeting) {
      console.error('No active meeting detected');
      return;
    }

    // Guard against duplicate calls for the same meeting window
    global.activeMeetingIds = global.activeMeetingIds || {};

    if (global.activeMeetingIds[detectedMeeting.window.id]?.noteId) {
      console.log("Meeting already being recorded for window:", detectedMeeting.window.id);
      return global.activeMeetingIds[detectedMeeting.window.id].noteId;
    }

    console.log("Detected meeting info:", detectedMeeting.window.id, detectedMeeting.window.platform);

    // Store the meeting window ID for later reference with transcript events
    global.activeMeetingIds[detectedMeeting.window.id] = { platformName };

    // Read the current meetings data
    let meetingsData;
    try {
      const fileData = await fs.promises.readFile(meetingsFilePath, 'utf8');
      meetingsData = JSON.parse(fileData);
    } catch (error) {
      console.error('Error reading meetings data:', error);
      meetingsData = { upcomingMeetings: [], pastMeetings: [] };
    }

    // Generate a unique ID for the new meeting
    const id = 'meeting-' + Date.now();

    // Current date and time
    const now = new Date();

    // Use the actual meeting title if available, otherwise fall back to platform name + time
    // NOTE: meeting-updated may fire after the user clicks to join, so this might not be
    // populated yet. The meeting-updated handler will update the title retroactively if needed.
    const meetingTitle = detectedMeeting.window.title 
      ? detectedMeeting.window.title 
      : `${platformName} Meeting - ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    // Create a template for the note content
    const template = `# ${meetingTitle}\nRecording: In Progress...`;

    // Create a new meeting object
    const newMeeting = {
      id: id,
      type: 'document',
      title: meetingTitle,
      subtitle: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hasDemo: false,
      date: now.toISOString(),
      participants: [],
      content: template,
      recordingId: detectedMeeting.window.id,
      platform: platformName,
      transcript: [] // Initialize an empty array for transcript data
    };

    // Update the active meeting tracking with the note ID
    if (global.activeMeetingIds && global.activeMeetingIds[detectedMeeting.window.id]) {
      global.activeMeetingIds[detectedMeeting.window.id].noteId = id;
    }

    // Create a call recording record in Twenty CRM
    if (twentyClient.isConfigured()) {
      try {
        const twentyRecord = await twentyClient.createCallRecording(meetingTitle);

        if (twentyRecord?.id) {
          newMeeting.twentyRecordId = twentyRecord.id;

          if (global.activeMeetingIds && global.activeMeetingIds[detectedMeeting.window.id]) {
            global.activeMeetingIds[detectedMeeting.window.id].twentyRecordId = twentyRecord.id;
          }

          console.log('Created callRecording in Twenty:', twentyRecord.id);
        }
      } catch (error) {
        console.error('Failed to create callRecording in Twenty:', error.message);
      }
    }

    // Register this meeting in our active recordings tracker (even before starting)
    // This ensures the UI knows about it immediately
    activeRecordings.addRecording(detectedMeeting.window.id, id, platformName);

    // Add to pastMeetings
    meetingsData.pastMeetings.unshift(newMeeting);

    // Save the updated data
    console.log(`Saving meeting data to ${meetingsFilePath} with ID: ${id}`);
    await fileOperationManager.writeData(meetingsData);

    // Verify the file was written by reading it back
    try {
      const verifyData = await fs.promises.readFile(meetingsFilePath, 'utf8');
      const parsedData = JSON.parse(verifyData);
      const verifyMeeting = parsedData.pastMeetings.find(m => m.id === id);

      if (verifyMeeting) {
        console.log(`Successfully verified meeting ${id} was saved`);

        // Tell the renderer to open the new note
        if (mainWindow && !mainWindow.isDestroyed()) {
          // We need a significant delay to make sure the file is fully processed and loaded
          // This ensures the renderer has time to process the file and recognize the new meeting
          setTimeout(async () => {
            try {
              // Force a file reload before sending the message
              await fs.promises.readFile(meetingsFilePath, 'utf8');

              console.log(`Sending IPC message to open meeting note: ${id}`);
              mainWindow.webContents.send('open-meeting-note', id);

              // Send another message after 2 seconds as a backup
              setTimeout(() => {
                console.log(`Sending backup IPC message to open meeting note: ${id}`);
                mainWindow.webContents.send('open-meeting-note', id);
              }, 2000);
            } catch (error) {
              console.error('Error before sending open-meeting-note message:', error);
            }
          }, 1500); // Increased delay for safety
        }
      } else {
        console.error(`Meeting ${id} not found in saved data!`);
      }
    } catch (verifyError) {
      console.error('Error verifying saved data:', verifyError);
    }

    // Start recording with upload token
    console.log('Starting recording for meeting:', detectedMeeting.window.id);

    try {
      // Get upload token
      const uploadData = await createDesktopSdkUpload();

      if (!uploadData || !uploadData.upload_token) {
        console.error('Failed to get upload token. Recording without upload token.');

        // Log the startRecording API call (no token fallback)
        sdkLogger.logApiCall('startRecording', {
          windowId: detectedMeeting.window.id
        });

        await RecallAiSdk.startRecording({
          windowId: detectedMeeting.window.id
        });
      } else {
        console.log('Starting recording with upload token:', uploadData.upload_token);

        // Store Recall upload/recording IDs on the meeting for later linking
        const savedMeeting = meetingsData.pastMeetings.find(m => m.id === id);
        if (savedMeeting) {
          savedMeeting.recallUploadId = uploadData.upload_id;
          savedMeeting.recallRecordingId = uploadData.recording_id;
          savedMeeting.recallUrl = buildRecallRecordingUrl(uploadData.upload_id);
          await fileOperationManager.writeData(meetingsData);
        }

        // Log the startRecording API call with upload token
        sdkLogger.logApiCall('startRecording', {
          windowId: detectedMeeting.window.id,
          uploadToken: `${uploadData.upload_token.substring(0, 8)}...` // Log truncated token for security
        });

        await RecallAiSdk.startRecording({
          windowId: detectedMeeting.window.id,
          uploadToken: uploadData.upload_token
        });
      }
    } catch (error) {
      console.error('Error starting recording with upload token:', error);

      // Fallback to recording without token

      // Log the startRecording API call (error fallback)
      sdkLogger.logApiCall('startRecording', {
        windowId: detectedMeeting.window.id,
        error: 'Fallback after error'
      });

      await RecallAiSdk.startRecording({
        windowId: detectedMeeting.window.id
      });
    }

    return id;
  } catch (error) {
    console.error('Error creating meeting note:', error);
  }
}

// Function to process video frames
async function processVideoFrame(evt) {
  try {
    const windowId = evt.window?.id;
    if (!windowId) {
      console.error("Missing window ID in video frame event");
      return;
    }

    // Check if we have this meeting in our active meetings
    if (!global.activeMeetingIds || !global.activeMeetingIds[windowId]) {
      console.log(`No active meeting found for window ID: ${windowId}`);
      return;
    }

    const noteId = global.activeMeetingIds[windowId].noteId;
    if (!noteId) {
      console.log(`No note ID found for window ID: ${windowId}`);
      return;
    }

    // Extract the video data
    const frameData = evt.data.data;
    if (!frameData || !frameData.buffer) {
      console.log("No video frame data in event");
      return;
    }

    // Get data from the event
    const frameBuffer = frameData.buffer; // base64 encoded PNG
    const frameTimestamp = frameData.timestamp;
    const frameType = frameData.type; // 'webcam' or 'screenshare'
    const participantData = frameData.participant;

    // Extract participant info
    const participantId = participantData?.id;
    const participantName = participantData?.name || 'Unknown';

    // Log minimal info to avoid flooding the console
    // console.log(`Received ${frameType} frame from ${participantName} (ID: ${participantId}) at ${frameTimestamp.absolute}`);

    // Send the frame to the renderer
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('video-frame', {
        noteId,
        participantId,
        participantName,
        frameType,
        buffer: frameBuffer,
        timestamp: frameTimestamp
      });
    }
  } catch (error) {
    console.error('Error processing video frame:', error);
  }
}

// Function to process participant join events
async function processParticipantJoin(evt) {
  try {
    const windowId = evt.window?.id;
    if (!windowId) {
      console.error("Missing window ID in participant join event");
      return;
    }

    // Check if we have this meeting in our active meetings
    if (!global.activeMeetingIds || !global.activeMeetingIds[windowId]) {
      console.log(`No active meeting found for window ID: ${windowId}`);
      return;
    }

    const noteId = global.activeMeetingIds[windowId].noteId;
    if (!noteId) {
      console.log(`No note ID found for window ID: ${windowId}`);
      return;
    }

    // Extract the participant data
    const participantData = evt.data.data.participant;
    if (!participantData) {
      console.log("No participant data in event");
      return;
    }

    const participantName = participantData.name || "Unknown Participant";
    const participantId = participantData.id;
    const isHost = participantData.is_host;
    const platform = participantData.platform;

    console.log(`Participant joined: ${participantName} (ID: ${participantId}, Host: ${isHost})`);

    // Skip "Host" and "Guest" generic names
    if (participantName === "Host" || participantName === "Guest" || participantName.includes("others") || (participantName.split(" ").length > 3)) {
      console.log(`Skipping generic participant name: ${participantName}`);
      return;
    }

    // Use the file operation manager to safely update the meetings data
    await fileOperationManager.scheduleOperation(async (meetingsData) => {
      // Find the meeting note with this ID
      const noteIndex = meetingsData.pastMeetings.findIndex(meeting => meeting.id === noteId);
      if (noteIndex === -1) {
        console.log(`No meeting note found with ID: ${noteId}`);
        return null; // Return null to indicate no changes needed
      }

      // Get the meeting and initialize participants array if needed
      const meeting = meetingsData.pastMeetings[noteIndex];
      if (!meeting.participants) {
        meeting.participants = [];
      }

      // Check if participant already exists (based on ID)
      const existingParticipantIndex = meeting.participants.findIndex(p => p.id === participantId);

      if (existingParticipantIndex !== -1) {
        // Update existing participant
        meeting.participants[existingParticipantIndex] = {
          id: participantId,
          name: participantName,
          isHost: isHost,
          platform: platform,
          joinTime: new Date().toISOString(),
          status: 'active'
        };
      } else {
        // Add new participant
        meeting.participants.push({
          id: participantId,
          name: participantName,
          isHost: isHost,
          platform: platform,
          joinTime: new Date().toISOString(),
          status: 'active'
        });
      }

      console.log(`Added/updated participant data for meeting: ${noteId}`);

      // Notify the renderer if this note is currently being edited
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('participants-updated', noteId);
      }

      // Return the updated data to be written
      return meetingsData;
    });

    console.log(`Processed participant join event for meeting: ${noteId}`);
  } catch (error) {
    console.error('Error processing participant join event:', error);
  }
}

// Tracks the currently active speaker as detected by the SDK's participant updates
let currentActiveSpeaker = null;

async function processTranscriptProviderData(evt) {
  // provider_data from AssemblyAI streaming only contains WebSocket handshake
  // messages, not actual transcript data with speaker IDs — intentionally ignored
}

// Function to process transcript data and store it with the meeting note
async function processTranscriptData(evt) {
  try {
    const windowId = evt.window?.id;
    if (!windowId) {
      console.error("Missing window ID in transcript event");
      return;
    }

    // Check if we have this meeting in our active meetings
    if (!global.activeMeetingIds || !global.activeMeetingIds[windowId]) {
      console.log(`No active meeting found for window ID: ${windowId}`);
      return;
    }

    const noteId = global.activeMeetingIds[windowId].noteId;
    if (!noteId) {
      console.log(`No note ID found for window ID: ${windowId}`);
      return;
    }

    const words = evt.data.data.words || [];
    if (words.length === 0) {
      return;
    }

    // The SDK's transcript.data always attributes speech to the host on Google Meet.
    // Use the active speaker tracked from SDK's internal participant updates instead.
    const speaker = currentActiveSpeaker || evt.data.data.participant?.name || "Unknown Speaker";
    console.log(`[speaker-debug] Using active speaker: ${speaker} (currentActiveSpeaker=${currentActiveSpeaker}, transcript.participant=${evt.data.data.participant?.name})`);

    const text = words.map(word => word.text).join(" ");
    console.log(`Transcript from ${speaker}: "${text}"`);

    await fileOperationManager.scheduleOperation(async (meetingsData) => {
      const noteIndex = meetingsData.pastMeetings.findIndex(meeting => meeting.id === noteId);
      if (noteIndex === -1) {
        console.log(`No meeting note found with ID: ${noteId}`);
        return null;
      }

      const meeting = meetingsData.pastMeetings[noteIndex];

      if (!meeting.transcript) {
        meeting.transcript = [];
      }

      // Store in the same format as the AssemblyAI transcript file so the
      // backend can upload it directly with correct speakers + timestamps
      meeting.transcript.push({
        participant: { name: speaker },
        words: words.map(word => ({
          text: word.text,
          start_timestamp: word.start_timestamp || undefined,
          end_timestamp: word.end_timestamp || undefined,
        })),
      });

      console.log(`Added transcript data for meeting: ${noteId}`);

      // Notify the renderer if this note is currently being edited
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('transcript-updated', noteId);
      }

      // Return the updated data to be written
      return meetingsData;
    });

    console.log(`Processed transcript data for meeting: ${noteId}`);
  } catch (error) {
    console.error('Error processing transcript data:', error);
  }
}

// Function to generate AI summary from transcript with streaming support
async function generateMeetingSummary(meeting, progressCallback = null) {
  try {
    if (!process.env.OPENROUTER_KEY || process.env.OPENROUTER_KEY === 'open_api_key') {
      console.log('Skipping AI summary: no valid OPENROUTER_KEY configured in .env');
      return 'AI summary unavailable — set a valid OPENROUTER_KEY in your .env file to enable this feature.';
    }

    if (!meeting.transcript || meeting.transcript.length === 0) {
      console.log('No transcript available to summarize');
      return 'No transcript available to summarize.';
    }

    console.log(`Generating AI summary for meeting: ${meeting.id}`);

    // Format the transcript into a single text for the AI to process
    const transcriptText = meeting.transcript.map(entry =>
      `${entry.speaker}: ${entry.text}`
    ).join('\n');

    // Format detected participants if available
    let participantsText = "";
    if (meeting.participants && meeting.participants.length > 0) {
      participantsText = "Detected participants:\n" + meeting.participants.map(p =>
        `- ${p.name}${p.isHost ? ' (Host)' : ''}`
      ).join('\n');
    }

    // Define a system prompt to guide the AI's response with a specific format
    const systemMessage =
      "You are an AI assistant that summarizes meeting transcripts. " +
      "You MUST format your response using the following structure:\n\n" +
      "# Participants\n" +
      "- [List all participants mentioned in the transcript]\n\n" +
      "# Summary\n" +
      "- [Key discussion point 1]\n" +
      "- [Key discussion point 2]\n" +
      "- [Key decisions made]\n" +
      "- [Include any important deadlines or dates mentioned]\n\n" +
      "# Action Items\n" +
      "- [Action item 1] - [Responsible person if mentioned]\n" +
      "- [Action item 2] - [Responsible person if mentioned]\n" +
      "- [Add any other action items discussed]\n\n" +
      "Stick strictly to this format with these exact section headers. Keep each bullet point concise but informative.";

    // Prepare the messages array for the API
    const messages = [
      { role: "system", content: systemMessage },
      {
        role: "user", content: `Summarize the following meeting transcript with the EXACT format specified in your instructions:
${participantsText ? participantsText + "\n\n" : ""}
Transcript:
${transcriptText}`
      }
    ];

    // If no progress callback provided, use the non-streaming version
    if (!progressCallback) {
      const response = await getOpenAIClient().chat.completions.create({
        model: MODELS.PRIMARY, // Use our primary model for a good balance of quality and speed
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        fallbacks: MODELS.FALLBACKS, // Use our defined fallback models
        transform_to_openai: true, // Ensures consistent response format across models
        route: "fallback" // Automatically use fallbacks if the primary model is unavailable
      });

      // Log which model was actually used
      console.log(`AI summary generated successfully using model: ${response.model}`);

      // Return the generated summary
      return response.choices[0].message.content;
    } else {
      // Use streaming version and accumulate the response
      let fullText = '';

      const stream = await getOpenAIClient().chat.completions.create({
        model: MODELS.PRIMARY, // Use our primary model for a good balance of quality and speed
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        stream: true,
        fallbacks: MODELS.FALLBACKS, // Use our defined fallback models
        transform_to_openai: true, // Ensures consistent response format across models
        route: "fallback" // Automatically use fallbacks if the primary model is unavailable
      });

      // Handle streaming events
      return new Promise((resolve, reject) => {
        // Process the stream
        (async () => {
          try {
            // Log the model being used when first chunk arrives (if available)
            let modelLogged = false;

            for await (const chunk of stream) {
              // Log the model on first chunk if available
              if (!modelLogged && chunk.model) {
                console.log(`Streaming with model: ${chunk.model}`);
                modelLogged = true;
              }

              // Extract the text content from the chunk
              const content = chunk.choices[0]?.delta?.content || '';

              if (content) {
                // Add the new text chunk to our accumulated text
                fullText += content;

                // Log each token for debugging (less verbose)
                if (content.length < 50) {
                  console.log(`Received token: "${content}"`);
                } else {
                  console.log(`Received content of length: ${content.length}`);
                }

                // Call the progress callback immediately with each token
                if (progressCallback) {
                  progressCallback(fullText);
                }
              }
            }

            console.log('AI summary streaming completed');
            resolve(fullText);
          } catch (error) {
            console.error('Stream error:', error);
            reject(error);
          }
        })();
      });
    }
  } catch (error) {
    console.error('Error generating meeting summary:', error);

    // Check if it's an OpenRouter/OpenAI specific error
    if (error.status) {
      return `Error generating summary: API returned status ${error.status}: ${error.message}`;
    } else if (error.response) {
      // Handle errors with a response object
      return `Error generating summary: ${error.response.status} - ${error.response.data?.error?.message || error.message}`;
    } else {
      // Default error handling
      return `Error generating summary: ${error.message}`;
    }
  }
}

// Function to update a note with recording information when recording ends
async function updateNoteWithRecordingInfo(recordingId) {
  try {
    // Read the current meetings data
    let meetingsData;
    try {
      const fileData = await fs.promises.readFile(meetingsFilePath, 'utf8');
      meetingsData = JSON.parse(fileData);
    } catch (error) {
      console.error('Error reading meetings data:', error);
      return;
    }

    // Find the meeting note with this recording ID
    const noteIndex = meetingsData.pastMeetings.findIndex(meeting =>
      meeting.recordingId === recordingId
    );

    if (noteIndex === -1) {
      console.log('No meeting note found for recording ID:', recordingId);
      return;
    }

    // Format current date
    const now = new Date();
    const formattedDate = now.toLocaleString();

    // Update the meeting note content
    const meeting = meetingsData.pastMeetings[noteIndex];
    const content = meeting.content;

    // Replace the "Recording: In Progress..." line with completed information
    let updatedContent = content.replace(
      "Recording: In Progress...",
      `Recording: Completed at ${formattedDate}\n`
    );

    // Update the meeting object
    meeting.content = updatedContent;
    meeting.recordingComplete = true;
    meeting.recordingEndTime = now.toISOString();

    // Save the initial update
    await fileOperationManager.writeData(meetingsData);

    // Build the Recall link footer
    const recallLink = meeting.recallUrl
      ? `\n\n---\nRecording: ${meeting.recallUrl}`
      : '';

    // Generate AI summary if there's a transcript
    if (meeting.transcript && meeting.transcript.length > 0) {
      console.log(`Generating AI summary for meeting ${meeting.id}...`);

      // Log summary generation to console instead of showing a notification
      console.log('Generating AI summary for meeting: ' + meeting.id);

      // Get meeting title for use in the new content
      const meetingTitle = meeting.title || "Meeting Notes";

      // Create initial content with placeholder
      meeting.content = `# ${meetingTitle}\nGenerating summary...`;

      // Notify any open editors immediately
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('summary-update', {
          meetingId: meeting.id,
          content: meeting.content
        });
      }

      // Create progress callback for streaming updates
      const streamProgress = (currentText) => {
        // Update content with current streaming text
        meeting.content = `# ${meetingTitle}\n\n${currentText}${recallLink}`;

        // Send immediate update to renderer if note is open
        if (mainWindow && !mainWindow.isDestroyed()) {
          try {
            mainWindow.webContents.send('summary-update', {
              meetingId: meeting.id,
              content: meeting.content,
              timestamp: Date.now()
            });
          } catch (err) {
            console.error('Error sending streaming update to renderer:', err);
          }
        }
      };

      // Generate the summary with streaming updates
      const summary = await generateMeetingSummary(meeting, streamProgress);

      // Set the content with summary and Recall link
      meeting.content = `${summary}${recallLink}`;

      meeting.hasSummary = true;

      // Save the updated data with summary
      await fileOperationManager.writeData(meetingsData);

      console.log('Updated meeting note with AI summary');
    } else {
      meeting.content = updatedContent + recallLink;
      await fileOperationManager.writeData(meetingsData);
    }

    // If the note is currently open, notify the renderer to refresh it
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('recording-completed', meeting.id);
    }
  } catch (error) {
    console.error('Error updating note with recording info:', error);
  }
}

ipcMain.handle('openExternal', async (event, url) => {
  if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
    await shell.openExternal(url);
  }
});

ipcMain.handle('getRecordingVideoUrl', async (event, recallRecordingId) => {
  try {
    const response = await axios.get(`http://localhost:13373/recording/${recallRecordingId}`, { timeout: 15000 });
    if (response.data.status === 'success' && response.data.video_url) {
      return { success: true, videoUrl: response.data.video_url, transcriptUrl: response.data.transcript_url };
    }
    return { success: false, error: response.data.message || 'Recording not ready yet' };
  } catch (error) {
    console.error('Error fetching recording video URL:', error.message);
    return { success: false, error: error.message };
  }
});

// Function to check if there's a detected meeting available
ipcMain.handle('checkForDetectedMeeting', async () => {
  return detectedMeeting !== null;
});

// Function to join the detected meeting
ipcMain.handle('joinDetectedMeeting', async () => {
  return joinDetectedMeeting();
});

// Function to handle joining a detected meeting
async function joinDetectedMeeting() {
  try {
    console.log("Join detected meeting called");

    if (!detectedMeeting) {
      console.log("No detected meeting available");
      return { success: false, error: "No active meeting detected" };
    }

    // Map platform codes to readable names
    const platformNames = {
      'zoom': 'Zoom',
      'google-meet': 'Google Meet',
      'slack': 'Slack',
      'teams': 'Microsoft Teams'
    };

    // Get a user-friendly platform name, or use the raw platform name if not in our map
    const platformName = platformNames[detectedMeeting.window.platform] || detectedMeeting.window.platform;

    console.log("Joining detected meeting for platform:", platformName);

    // Ensure main window exists and is visible
    if (!mainWindow || mainWindow.isDestroyed()) {
      console.log("Creating new main window");
      createWindow();
    }

    // Bring window to front with focus
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();

    // Process with more reliable timing
    return new Promise((resolve) => {
      // Wait a moment for the window to be fully focused and ready
      setTimeout(async () => {
        console.log("Window is ready, creating new meeting note");

        try {
          // Create a new meeting note and start recording
          const id = await createMeetingNoteAndRecord(platformName);

          console.log("Created new meeting with ID:", id);
          resolve({ success: true, meetingId: id });
        } catch (err) {
          console.error("Error creating meeting note:", err);
          resolve({ success: false, error: err.message });
        }
      }, 800); // Increased timeout for more reliability
    });
  } catch (error) {
    console.error("Error in joinDetectedMeeting:", error);
    return { success: false, error: error.message };
  }
}
