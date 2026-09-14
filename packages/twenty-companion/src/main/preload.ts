import { contextBridge, ipcRenderer } from 'electron';
import {
  type CompanionBridge,
  type CompanionState,
  type CompanionPage,
} from '../shared/types';

const bridge: CompanionBridge = {
  getState: () => ipcRenderer.invoke('companion:state'),
  command: (command) => ipcRenderer.invoke('companion:command', command),
  onState: (listener) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      state: CompanionState,
    ) => listener(state);
    ipcRenderer.on('companion:state', handler);
    return () => {
      ipcRenderer.removeListener('companion:state', handler);
    };
  },
  onNavigate: (listener) => {
    const handler = (_event: Electron.IpcRendererEvent, page: CompanionPage) =>
      listener(page);
    ipcRenderer.on('companion:navigate', handler);
    return () => ipcRenderer.removeListener('companion:navigate', handler);
  },
};
contextBridge.exposeInMainWorld('companion', bridge);
