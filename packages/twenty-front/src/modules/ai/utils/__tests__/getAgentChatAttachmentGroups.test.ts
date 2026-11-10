import { type ExtendedFileUIPart } from 'twenty-shared/ai';

import { getAgentChatAttachmentGroups } from '@/ai/utils/getAgentChatAttachmentGroups';

const buildFilePart = (
  filename: string,
  url = `https://api.example.com/file/agent-chat/${filename}`,
): ExtendedFileUIPart => ({
  type: 'file',
  fileId: filename,
  filename,
  mediaType: 'application/octet-stream',
  url,
});

const getLabels = (files: { label: string }[]) =>
  files.map(({ label }) => label);

describe('getAgentChatAttachmentGroups', () => {
  it('keeps a single image as a standalone attachment', () => {
    const groups = getAgentChatAttachmentGroups([
      buildFilePart('chart.png'),
      buildFilePart('brief.pdf'),
    ]);

    expect(groups.gridImages).toEqual([]);
    expect(getLabels(groups.standaloneAttachments)).toEqual([
      'chart.png',
      'brief.pdf',
    ]);
  });

  it('groups several images into the grid and keeps other files apart', () => {
    const groups = getAgentChatAttachmentGroups([
      buildFilePart('chart.png'),
      buildFilePart('brief.pdf'),
      buildFilePart('team.jpg'),
      buildFilePart('logo.webp'),
    ]);

    expect(getLabels(groups.gridImages)).toEqual([
      'chart.png',
      'team.jpg',
      'logo.webp',
    ]);
    expect(getLabels(groups.standaloneAttachments)).toEqual(['brief.pdf']);
  });

  it('leaves images without a url out of the grid', () => {
    const groups = getAgentChatAttachmentGroups([
      buildFilePart('chart.png'),
      buildFilePart('pending.png', ''),
    ]);

    expect(groups.gridImages).toEqual([]);
    expect(getLabels(groups.standaloneAttachments)).toEqual([
      'chart.png',
      'pending.png',
    ]);
  });
});
