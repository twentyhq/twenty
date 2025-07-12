import { AgentChatFile } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/agentChatUploadedFilesComponentState';
import {
  IconArchive,
  IconCode,
  IconCsv,
  IconDatabase,
  IconFile,
  IconFileText,
  IconJson,
  IconPhoto,
  IconPresentation,
  IconVideo,
} from 'twenty-ui/display';

export const getFileIcon = (file: File | AgentChatFile, theme: any) => {
  const { type, name } = file;
  const fileName = name.toLowerCase();

  if (type.startsWith('image/')) {
    return <IconPhoto size={theme.icon.size.lg} color={theme.color.yellow} />;
  }

  if (type.startsWith('video/')) {
    return <IconVideo size={theme.icon.size.lg} color={theme.color.red} />;
  }

  if (
    type.includes('javascript') ||
    type.includes('typescript') ||
    fileName.endsWith('.js') ||
    fileName.endsWith('.jsx') ||
    fileName.endsWith('.ts') ||
    fileName.endsWith('.tsx') ||
    fileName.endsWith('.py') ||
    fileName.endsWith('.java') ||
    fileName.endsWith('.cpp') ||
    fileName.endsWith('.c') ||
    fileName.endsWith('.php') ||
    fileName.endsWith('.rb') ||
    fileName.endsWith('.go') ||
    fileName.endsWith('.rs')
  ) {
    return <IconCode size={theme.icon.size.lg} color={theme.color.green} />;
  }

  if (type.includes('json') || fileName.endsWith('.json')) {
    return <IconJson size={theme.icon.size.lg} color={theme.color.orange} />;
  }

  if (type.includes('csv') || fileName.endsWith('.csv')) {
    return <IconCsv size={theme.icon.size.lg} color={theme.color.green} />;
  }

  if (
    type.includes('sql') ||
    fileName.endsWith('.sql') ||
    fileName.endsWith('.db') ||
    fileName.endsWith('.sqlite')
  ) {
    return <IconDatabase size={theme.icon.size.lg} color={theme.color.blue} />;
  }

  if (
    type.includes('pdf') ||
    type.includes('document') ||
    type.includes('text/plain') ||
    fileName.endsWith('.txt') ||
    fileName.endsWith('.doc') ||
    fileName.endsWith('.docx')
  ) {
    return <IconFileText size={theme.icon.size.lg} color={theme.color.blue} />;
  }

  if (
    type.includes('presentation') ||
    type.includes('powerpoint') ||
    fileName.endsWith('.ppt') ||
    fileName.endsWith('.pptx')
  ) {
    return (
      <IconPresentation size={theme.icon.size.lg} color={theme.color.orange} />
    );
  }

  if (
    type.includes('zip') ||
    type.includes('rar') ||
    type.includes('tar') ||
    type.includes('gzip') ||
    fileName.endsWith('.zip') ||
    fileName.endsWith('.rar') ||
    fileName.endsWith('.tar') ||
    fileName.endsWith('.gz') ||
    fileName.endsWith('.7z')
  ) {
    return <IconArchive size={theme.icon.size.lg} color={theme.color.purple} />;
  }

  return <IconFile size={theme.icon.size.lg} color={theme.color.gray} />;
};
