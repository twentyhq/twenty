import { FileUploadProvider } from '@/file-upload/components/FileUploadProvider';
import { type Decorator } from '@storybook/react-vite';

export const FileUploadDecorator: Decorator = (Story) => (
  <FileUploadProvider>
    <Story />
  </FileUploadProvider>
);
