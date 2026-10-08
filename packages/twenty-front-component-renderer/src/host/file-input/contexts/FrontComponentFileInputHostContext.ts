import { createContext } from 'react';

import { type FileInputHost } from '@/host/file-input/types/FileInputHost';

export const FrontComponentFileInputHostContext =
  createContext<FileInputHost | null>(null);
