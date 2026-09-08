import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import RecallAiSdk from '@recallai/desktop-sdk';
import {
  app,
  BrowserWindow,
  Tray,
  nativeImage,
  globalShortcut,
  Menu,
  powerMonitor,
  dialog,
  ipcMain,
} from 'electron';
import { getUpcomingMeetings } from '../shared/meetings';
import { Companion } from './companion';
import { createTrayMenuTemplate, getTrayTitle } from './tray-menu';
import { commandSchema, type CompanionPage } from '../shared/types';

let mainWindow: BrowserWindow;
let tray: Tray;
let trayMenu: Menu;
let trayMenuSignature = '';
let trayMenuOpen = false;
let companion: Companion;
let quitting = false;
let shutdownPending = false;
const SMOKE = process.argv.includes('--smoke');
const OPEN_IN_BACKGROUND = process.argv.includes('--background');
const DEVELOPMENT_URL = process.env.TWENTY_COMPANION_DEV_URL;
const RENDERER_PATH = join(__dirname, 'renderer/index.html');
const rendererReady = new Set<number>();
let pendingPage: CompanionPage | undefined;
const [MACOS_MAJOR, MACOS_MINOR] =
  process.platform === 'darwin'
    ? process.getSystemVersion().split('.').map(Number)
    : [0, 0];
const MENU_PRESENTATION = {
  supportsHeaders: MACOS_MAJOR >= 14,
  supportsSublabels:
    MACOS_MAJOR > 14 || (MACOS_MAJOR === 14 && MACOS_MINOR >= 4),
};

const showApp = (page?: CompanionPage) => {
  if (quitting || !mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
  if (page) {
    if (rendererReady.has(mainWindow.webContents.id))
      mainWindow.webContents.send('companion:navigate', page);
    else pendingPage = page;
  }
};

const runCommand = async (command: unknown) => {
  const parsed = commandSchema.parse(command);
  if (parsed.type === 'open-app') {
    showApp(parsed.page);
    return;
  }
  await companion.command(parsed);
  if (
    companion.state.error ||
    (parsed.type === 'record' && companion.state.activeRecording)
  )
    showApp();
};

const updateTrayMenu = () => {
  if (!companion || quitting || tray.isDestroyed() || trayMenuOpen) return;
  const template = createTrayMenuTemplate(
    companion.state,
    {
      command: (command) => void runCommand(command),
      openApp: showApp,
      setSetting: (key, value) =>
        void runCommand({
          type: 'settings',
          settings: { [key]: value },
        }),
      quit: () => app.quit(),
    },
    Date.now(),
    { ...MENU_PRESENTATION, locale: app.getLocale() },
  );
  const signature = JSON.stringify({
    template,
    meetingIds: companion.state.meetings.map((meeting) => meeting.id),
    recordingId: companion.state.activeRecording?.id,
  });
  if (signature === trayMenuSignature) return;
  trayMenuSignature = signature;
  trayMenu = Menu.buildFromTemplate(template);
  // Replacing a menu during keyboard navigation would move the user's selection.
  trayMenu.on('menu-will-show', () => {
    trayMenuOpen = true;
  });
  trayMenu.on('menu-will-close', () => {
    trayMenuOpen = false;
    setImmediate(updateTrayMenu);
  });
  tray.setContextMenu(trayMenu);
};

const assertSender = (event: Electron.IpcMainInvokeEvent) => {
  const url = event.senderFrame?.url;
  const expected = DEVELOPMENT_URL
    ? new URL(DEVELOPMENT_URL).origin
    : pathToFileURL(RENDERER_PATH).href;
  if (
    event.senderFrame !== event.sender.mainFrame ||
    event.sender !== mainWindow.webContents ||
    !url ||
    (DEVELOPMENT_URL
      ? new URL(url).origin !== expected
      : url.split('#')[0] !== expected)
  )
    throw new Error('Untrusted companion window.');
};

// Keep existing connections and settings when the visible app name changes.
if (!SMOKE)
  app.setPath('userData', join(app.getPath('appData'), 'Twenty Companion'));

if (!app.requestSingleInstanceLock()) app.quit();
else {
  // Electron binds macOS encryption to this name before ready.
  app.setName('Twenty Companion');
  if (SMOKE) {
    const directory = mkdtempSync(join(tmpdir(), 'twenty-companion-smoke-'));
    app.setPath('userData', directory);
    app.on('quit', () => {
      try {
        // Chromium can finish writing its cache while the smoke app exits.
        rmSync(directory, { recursive: true, force: true, maxRetries: 3 });
      } catch {
        console.warn(
          'Smoke cache cleanup deferred to the system temporary directory.',
        );
      }
    });
  }
  app.on('second-instance', () => showApp());
  app.on('activate', () => showApp());
  void app
    .whenReady()
    .then(async () => {
      app.setName('Twenty');
      await app.dock?.show();
      const webPreferences = {
        preload: join(__dirname, 'preload.cjs'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      };
      mainWindow = new BrowserWindow({
        width: 1040,
        height: 740,
        minWidth: 760,
        minHeight: 580,
        show: false,
        title: 'Twenty',
        titleBarStyle:
          process.platform === 'darwin' ? 'hiddenInset' : 'default',
        trafficLightPosition: { x: 18, y: 25 },
        backgroundColor: '#171717',
        webPreferences,
      });
      mainWindow.webContents.on('did-start-loading', () =>
        rendererReady.delete(mainWindow.webContents.id),
      );
      mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
      mainWindow.webContents.on('will-navigate', (event) =>
        event.preventDefault(),
      );
      mainWindow.on('focus', () => companion?.refreshPermissions());
      mainWindow.on('close', (event) => {
        if (!quitting) {
          event.preventDefault();
          mainWindow.hide();
        }
      });
      const trayImage = nativeImage.createFromPath(
        join(__dirname, '../assets/trayLogo.png'),
      );
      if (trayImage.isEmpty()) throw new Error('The menu bar icon is missing.');
      if (process.platform === 'darwin') trayImage.setTemplateImage(true);
      tray = new Tray(trayImage, '8fd0b192-e117-4987-8b6f-98ef6f6f0c35');
      tray.setToolTip('Twenty');
      if (process.platform === 'win32')
        tray.on('click', () => tray.popUpContextMenu());
      const updateApplicationMenu = (shortcut: string) =>
        Menu.setApplicationMenu(
          Menu.buildFromTemplate([
            ...(process.platform === 'darwin'
              ? [{ role: 'appMenu' as const }]
              : []),
            {
              label: 'File',
              submenu: [
                {
                  id: 'open-companion',
                  label: 'Open app',
                  accelerator: shortcut,
                  click: () => showApp(),
                },
                {
                  label: 'Meeting menu',
                  accelerator: 'CommandOrControl+Shift+M',
                  click: () => {
                    updateTrayMenu();
                    tray.popUpContextMenu();
                  },
                },
                {
                  label: 'Settings…',
                  accelerator: 'CommandOrControl+,',
                  click: () => showApp('settings'),
                },
                { type: 'separator' },
                { role: 'close' },
              ],
            },
            { role: 'editMenu' },
            { role: 'viewMenu' },
            { role: 'windowMenu' },
          ]),
        );
      updateApplicationMenu('CommandOrControl+Shift+Space');
      let registeredOpenShortcut: string | undefined;
      companion = new Companion(
        (state) => {
          if (!mainWindow.webContents.isDestroyed())
            mainWindow.webContents.send('companion:state', state);
          updateTrayMenu();
          const next = getUpcomingMeetings(state.meetings, Date.now())[0];
          const recording = state.activeRecording;
          tray.setTitle(getTrayTitle(state));
          tray.setToolTip(
            recording
              ? (recording.status === 'paused' ? 'Paused' : 'Recording') +
                  ' · ' +
                  recording.title
              : next
                ? 'Twenty · ' + next.title
                : 'Twenty',
          );
        },
        () => showApp(),
        (shortcut) => {
          if (shortcut === registeredOpenShortcut) return;
          let registered = false;
          try {
            registered = globalShortcut.register(shortcut, () => showApp());
          } catch {
            throw new Error(
              'This shortcut is invalid. Choose another key combination.',
            );
          }
          if (!registered)
            throw new Error(
              'This shortcut is already in use. Choose another key combination.',
            );
          try {
            // Electron accelerators are immutable after menu construction.
            updateApplicationMenu(shortcut);
          } catch (error) {
            globalShortcut.unregister(shortcut);
            throw error;
          }
          if (registeredOpenShortcut)
            globalShortcut.unregister(registeredOpenShortcut);
          registeredOpenShortcut = shortcut;
        },
      );
      updateTrayMenu();
      ipcMain.handle('companion:state', (event) => {
        assertSender(event);
        rendererReady.add(event.sender.id);
        if (pendingPage) {
          event.sender.send('companion:navigate', pendingPage);
          pendingPage = undefined;
        }
        return companion.state;
      });
      ipcMain.handle('companion:command', async (event, value: unknown) => {
        assertSender(event);
        await runCommand(value);
      });
      if (DEVELOPMENT_URL) {
        if (new URL(DEVELOPMENT_URL).origin !== 'http://127.0.0.1:4317')
          throw new Error('Unexpected development server.');
        await mainWindow.loadURL(DEVELOPMENT_URL);
      } else {
        await mainWindow.loadFile(RENDERER_PATH);
      }
      powerMonitor.on(
        'resume',
        () => void companion.command({ type: 'refresh' }),
      );
      await companion.initialize();
      if (SMOKE) {
        await RecallAiSdk.init({
          apiUrl: 'https://eu-central-1.recall.ai',
          acquirePermissionsOnStartup: [],
        });
        await RecallAiSdk.shutdown();
        if (
          rendererReady.size !== 1 ||
          BrowserWindow.getAllWindows().length !== 1 ||
          !trayMenu?.items.length
        )
          throw new Error(
            'The main window must establish secure IPC and the native tray menu must be ready.',
          );
        console.log(
          'Companion smoke passed: one main window, native tray menu, secure IPC, native Recall SDK.',
        );
        await companion.shutdown();
        quitting = true;
        setImmediate(() => app.quit());
        return;
      }
      if (!OPEN_IN_BACKGROUND) showApp();
    })
    .catch((error: unknown) => {
      if (SMOKE) {
        console.error('Companion smoke failed:', error);
        app.exit(1);
        return;
      }
      dialog.showErrorBox(
        'Twenty could not start',
        error instanceof Error
          ? error.message
          : 'Restart the app to try again.',
      );
      quitting = true;
      app.quit();
    });
  app.on('before-quit', (event) => {
    if (quitting) return;
    event.preventDefault();
    if (shutdownPending) return;
    shutdownPending = true;
    void (async () => {
      try {
        if (companion?.state.activeRecording) {
          const { response } = await dialog.showMessageBox(mainWindow, {
            type: 'question',
            message: 'Stop recording and quit?',
            detail: 'The recording will finish processing in Twenty.',
            buttons: ['Keep recording', 'Stop and quit'],
            cancelId: 0,
            defaultId: 0,
          });
          if (response === 0) return;
        }
        await companion?.shutdown();
        quitting = true;
        globalShortcut.unregisterAll();
        setImmediate(() => app.quit());
      } catch (error) {
        dialog.showErrorBox(
          'Twenty could not finish quitting',
          error instanceof Error ? error.message : 'Try quitting again.',
        );
      } finally {
        shutdownPending = false;
      }
    })();
  });
}
